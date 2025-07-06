import React, { useState } from 'react';
import { MapPin, User, Sparkles, Download, Globe, Heart, Star, ExternalLink, Key, AlertTriangle, Brain, TrendingUp, Zap, CreditCard } from 'lucide-react';
import { OpenAIService } from './services/openaiService';
import { QlooApiService } from './services/qlooApiService';
import { QlooTasteAnalyzer } from './components/QlooTasteAnalyzer';
import { QlooTasteProfile, BehaviorInsight, TasteConnection } from './types/qloo';

interface TasteProfile {
  interests: string[];
  preferences: {
    food: string[];
    activities: string[];
    accommodation: string[];
    culture: string[];
  };
  budget: string;
  travelStyle: string;
}

interface Recommendation {
  name: string;
  description: string;
  imageUrl: string;
  culturalContext: string;
  link?: string;
  tags: string[];
  rating: number;
  qlooAlignment?: {
    behaviorMatch: string[];
    affinityScore: number;
    reasoning: string;
  };
}

function App() {
  const [destination, setDestination] = useState('');
  const [userPreferences, setUserPreferences] = useState('');
  const [tasteProfile, setTasteProfile] = useState('');
  const [useQlooProfile, setUseQlooProfile] = useState(false);
  const [qlooProfile, setQlooProfile] = useState<QlooTasteProfile | null>(null);
  const [behaviorInsights, setBehaviorInsights] = useState<BehaviorInsight[]>([]);
  const [tasteConnections, setTasteConnections] = useState<TasteConnection[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showQlooAnalysis, setShowQlooAnalysis] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<'general' | 'quota' | 'billing'>('general');
  const [isUsingRealQloo, setIsUsingRealQloo] = useState(false);

  // Get API keys from environment variables
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  const QLOO_API_KEY = import.meta.env.VITE_QLOO_API_KEY;

  const mockTasteProfile = {
    interests: ["traditional crafts", "authentic cuisine", "historical sites", "cultural immersion"],
    preferences: {
      food: ["local specialties", "traditional dining", "street food"],
      activities: ["workshops", "guided tours", "cultural experiences"],
      accommodation: ["boutique hotels", "traditional lodging"],
      culture: ["artisan crafts", "traditional ceremonies", "local traditions"]
    },
    budget: "mid-range",
    travelStyle: "cultural explorer"
  };

  const loadQlooProfile = async () => {
    setIsLoading(true);
    setError('');
    setErrorType('general');
    
    try {
      const qlooService = new QlooApiService(QLOO_API_KEY);
      let fetchedProfile: QlooTasteProfile;
      
      // Try to get real Qloo profile first with enhanced error handling
      try {
        const response = await qlooService.getTasteProfile('demo_user', ['travel', 'dining', 'entertainment', 'music']);
        fetchedProfile = response;
        setIsUsingRealQloo(true);
      } catch (apiError) {
        console.warn('Qloo API not available, using enhanced sample data:', apiError);
        // Use sample data if API fails - this is expected behavior, not an error
        fetchedProfile = qlooService.createSampleProfile();
        setIsUsingRealQloo(false);
      }

      setUseQlooProfile(true);
      
      // Generate behavioral insights and connections
      try {
        const insights = await QlooApiService.analyzeBehaviorPatterns(fetchedProfile);
        const connections = QlooApiService.generateTasteConnections(fetchedProfile);
        
        setBehaviorInsights(insights);
        setTasteConnections(connections);
        setQlooProfile(fetchedProfile);
        setShowQlooAnalysis(true);
      } catch (analysisError) {
        console.error('Error analyzing behavior patterns:', analysisError);
        // Still show the profile even if analysis fails
        setQlooProfile(fetchedProfile);
        setShowQlooAnalysis(true);
        setBehaviorInsights([]);
        setTasteConnections([]);
      }
    } catch (error) {
      console.error('Failed to load Qloo profile:', error);
      // Only show error for unexpected failures, not API authentication issues
      if (error instanceof Error && !error.message.includes('401')) {
        setError(`Failed to load Qloo profile: ${error.message}`);
      } else {
        // For 401 errors, just use sample data without showing error
        const qlooService = new QlooApiService(QLOO_API_KEY);
        const fetchedProfile = qlooService.createSampleProfile();
        setQlooProfile(fetchedProfile);
        setUseQlooProfile(true);
        setShowQlooAnalysis(true);
        setIsUsingRealQloo(false);
        setBehaviorInsights([]);
        setTasteConnections([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = async () => {
    setIsLoading(true);
    setError('');
    setErrorType('general');
    
    try {
      // Check if API key is available
      if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
        throw new Error('OpenAI API key is not configured. Please add your API key to the .env file.');
      }

      const openaiService = new OpenAIService(OPENAI_API_KEY);
      
      let profileToUse: TasteProfile | string | QlooTasteProfile;
      
      if (useQlooProfile && qlooProfile) {
        profileToUse = qlooProfile;
      } else if (tasteProfile.trim()) {
        try {
          profileToUse = JSON.parse(tasteProfile);
        } catch {
          profileToUse = tasteProfile;
        }
      } else {
        profileToUse = mockTasteProfile;
      }

      const generatedRecommendations = await openaiService.generateRecommendations(
        destination,
        userPreferences,
        profileToUse,
        behaviorInsights,
        tasteConnections
      );
      
      setRecommendations(generatedRecommendations);
      setShowResults(true);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      // Check for specific OpenAI error types
      if (error instanceof Error) {
        if (error.message.includes('429') && error.message.includes('quota')) {
          setErrorType('quota');
          setError('Your OpenAI API quota has been exceeded. Please check your OpenAI account billing and usage limits.');
        } else if (error.message.includes('429')) {
          setErrorType('billing');
          setError('OpenAI API rate limit exceeded. Please check your OpenAI account status and billing details.');
        } else {
          setErrorType('general');
          setError(error.message);
        }
      } else {
        setErrorType('general');
        setError('Failed to generate recommendations. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const exportRecommendations = () => {
    const dataStr = JSON.stringify(recommendations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${destination.toLowerCase().replace(/\s/g, '-')}-travel-recommendations.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Check if API keys are configured
  const isConfigured = OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here';

  const renderError = () => {
    if (!error) return null;

    const getErrorIcon = () => {
      switch (errorType) {
        case 'quota':
        case 'billing':
          return <CreditCard className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />;
        default:
          return <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />;
      }
    };

    const getErrorContent = () => {
      switch (errorType) {
        case 'quota':
          return (
            <div>
              <p className="font-medium mb-2">OpenAI API Quota Exceeded</p>
              <p className="mb-3">{error}</p>
              <div className="bg-red-100 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium mb-2">To resolve this issue:</p>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Visit <a href="https://platform.openai.com/account/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Billing Dashboard</a></li>
                  <li>Check your current usage and billing details</li>
                  <li>Add credits or upgrade your plan if needed</li>
                  <li>Wait a few minutes for the changes to take effect</li>
                </ol>
              </div>
              <a 
                href="https://platform.openai.com/account/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                <span>Check OpenAI Billing</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          );
        case 'billing':
          return (
            <div>
              <p className="font-medium mb-2">OpenAI API Rate Limit</p>
              <p className="mb-3">{error}</p>
              <div className="bg-red-100 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium mb-2">To resolve this issue:</p>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Check your <a href="https://platform.openai.com/account/usage" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Usage Dashboard</a></li>
                  <li>Verify your account has sufficient credits</li>
                  <li>Consider upgrading to a higher tier plan</li>
                  <li>Wait a few minutes before trying again</li>
                </ol>
              </div>
              <a 
                href="https://platform.openai.com/account/usage" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Check Usage</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          );
        default:
          return (
            <div>
              <p className="font-medium mb-1">Error</p>
              <p>{error}</p>
            </div>
          );
      }
    };

    return (
      <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          {getErrorIcon()}
          <div className="text-sm text-red-800 flex-1">
            {getErrorContent()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CulturalGuide AI</h1>
                <p className="text-sm text-gray-600">Powered by Qloo Taste AI™ + OpenAI GPT-4</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isConfigured ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                <Key className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {isConfigured ? 'APIs Configured' : 'Setup Required'}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Brain className="h-4 w-4" />
                <span>Real-time AI Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Configuration Warning */}
        {!isConfigured && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Key className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">API Configuration Required</p>
                <p>Please add your OpenAI API key to the .env file to use the recommendation features. Copy .env.example to .env and add your API keys.</p>
              </div>
            </div>
          </div>
        )}

        {renderError()}

        {!showResults ? (
          <div className="space-y-8">
            {/* Qloo Taste AI Demo Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Experience Qloo Taste AI™</h2>
                  <p className="text-purple-100 mb-4">
                    Real behavioral analysis from integrated Qloo API - see how music, dining, and entertainment choices predict perfect travel experiences
                  </p>
                  <button
                    onClick={loadQlooProfile}
                    disabled={isLoading}
                    className="bg-white text-purple-600 hover:bg-purple-50 disabled:bg-gray-200 disabled:text-gray-500 font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Brain className="h-5 w-5" />
                    <span>
                      {isLoading 
                        ? 'Loading Qloo Profile...' 
                        : 'Load Qloo Taste Profile'
                      }
                    </span>
                  </button>
                </div>
                <div className="hidden lg:block">
                  <TrendingUp className="h-24 w-24 text-purple-300" />
                </div>
              </div>
            </div>

            {/* Qloo Analysis Display */}
            {showQlooAnalysis && qlooProfile && (
              <QlooTasteAnalyzer
                tasteProfile={qlooProfile}
                behaviorInsights={behaviorInsights}
                tasteConnections={tasteConnections}
              />
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <MapPin className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Travel Preferences</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Destination
                      </label>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="e.g., Kyoto, Japan"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Travel Interests
                      </label>
                      <textarea
                        value={userPreferences}
                        onChange={(e) => setUserPreferences(e.target.value)}
                        placeholder="e.g., I want to experience authentic Japanese culture in Kyoto, especially related to traditional crafts and local cuisine..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <User className="h-6 w-6 text-amber-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Taste Profile</h2>
                  </div>
                  
                  {useQlooProfile && qlooProfile ? (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center space-x-2 mb-4">
                        <Brain className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold text-purple-900">
                          Using {isUsingRealQloo ? 'Real' : 'Enhanced Sample'} Qloo Taste AI™ Profile
                        </span>
                      </div>
                      <p className="text-sm text-purple-700 mb-4">
                        {isUsingRealQloo 
                          ? 'Real behavioral analysis from Qloo API. Your music, dining, and entertainment patterns are being used to predict travel preferences.'
                          : 'Enhanced sample behavioral analysis active. Demonstrates how music, dining, and entertainment patterns predict travel preferences.'
                        }
                      </p>
                      <button
                        onClick={() => {
                          setUseQlooProfile(false);
                          setShowQlooAnalysis(false);
                        }}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
                      >
                        Switch to manual profile
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Taste Profile (JSON format)
                        </label>
                        <textarea
                          value={tasteProfile}
                          onChange={(e) => setTasteProfile(e.target.value)}
                          placeholder="Paste your taste profile JSON here..."
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 resize-none font-mono text-sm"
                        />
                      </div>
                      
                      <button
                        onClick={() => setTasteProfile(JSON.stringify(mockTasteProfile, null, 2))}
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium transition-colors duration-200"
                      >
                        Use sample taste profile
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={generateRecommendations}
                  disabled={!destination || !userPreferences || isLoading || !isConfigured}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating with {useQlooProfile ? 'Qloo + ' : ''}GPT-4 AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Generate AI Recommendations</span>
                    </>
                  )}
                </button>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">How Qloo Taste AI™ Works</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                      <Brain className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Behavioral Pattern Analysis</h4>
                      <p className="text-gray-600 text-sm">
                        Real-time analysis of music, dining, entertainment, and shopping habits via integrated Qloo API to understand cultural preferences.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Taste Graph Connections</h4>
                      <p className="text-gray-600 text-sm">Maps neural pathways between your daily choices and travel preferences using AI correlation analysis.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 rounded-full p-2 flex-shrink-0">
                      <MapPin className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Predictive Recommendations</h4>
                      <p className="text-gray-600 text-sm">Generates travel suggestions with confidence scores based on behavioral alignment and cultural affinity.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">GPT-4 AI Enhancement</h4>
                      <p className="text-gray-600 text-sm">Combines Qloo insights with GPT-4's cultural knowledge for rich, contextual travel recommendations.</p>
                    </div>
                  </div>
                </div>

                {/* API Status Indicators */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">API Integration Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm text-gray-600">
                        OpenAI GPT-4 API: {isConfigured ? 'Connected' : 'Setup Required'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Qloo Taste AI™ API: Integrated</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    AI-Generated Recommendations for {destination}
                  </h2>
                  <p className="text-gray-600">
                    Powered by {useQlooProfile ? `${isUsingRealQloo ? 'Real' : 'Enhanced Sample'} Qloo Taste AI™ + ` : ''}OpenAI GPT-4 • Based on your preferences and behavioral patterns
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={exportRecommendations}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={() => setShowResults(false)}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    <span>New Search</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="relative">
                    <img
                      src={rec.imageUrl}
                      alt={rec.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=800`;
                      }}
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold">{rec.rating}</span>
                    </div>
                    {rec.qlooAlignment && (
                      <div className="absolute top-4 left-4 bg-purple-600/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                        <Brain className="h-4 w-4 text-white" />
                        <span className="text-sm font-semibold text-white">{Math.round(rec.qlooAlignment.affinityScore * 100)}%</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{rec.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{rec.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Heart className="h-4 w-4 text-red-500 mr-2" />
                        Cultural Context
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{rec.culturalContext}</p>
                    </div>

                    {rec.qlooAlignment && (
                      <div className="mb-4 bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                          <Brain className="h-4 w-4 text-purple-600 mr-2" />
                          Qloo Behavioral Match
                        </h4>
                        <p className="text-sm text-purple-700 mb-2">{rec.qlooAlignment.reasoning}</p>
                        <div className="flex flex-wrap gap-1">
                          {rec.qlooAlignment.behaviorMatch.map((behavior, idx) => (
                            <span key={idx} className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">
                              {behavior}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {rec.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {rec.link && (
                      <a
                        href={rec.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                      >
                        <span>Learn More</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              Powered by Integrated Qloo Taste AI™ + OpenAI GPT-4 • Built for authentic travel experiences
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;