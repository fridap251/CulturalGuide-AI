import React from 'react';
import { Brain, TrendingUp, Users, Music, Utensils, Film, ShoppingBag, MapPin, ArrowRight } from 'lucide-react';
import { QlooTasteProfile, BehaviorInsight, TasteConnection } from '../types/qloo';

interface QlooTasteAnalyzerProps {
  tasteProfile: QlooTasteProfile;
  behaviorInsights: BehaviorInsight[];
  tasteConnections: TasteConnection[];
}

export const QlooTasteAnalyzer: React.FC<QlooTasteAnalyzerProps> = ({
  tasteProfile,
  behaviorInsights,
  tasteConnections
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'music': return <Music className="h-5 w-5" />;
      case 'dining': return <Utensils className="h-5 w-5" />;
      case 'entertainment': return <Film className="h-5 w-5" />;
      case 'shopping': return <ShoppingBag className="h-5 w-5" />;
      case 'social': return <Users className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 0.8) return 'bg-blue-600';
    if (strength >= 0.6) return 'bg-blue-500';
    if (strength >= 0.4) return 'bg-blue-400';
    return 'bg-blue-300';
  };

  return (
    <div className="space-y-8">
      {/* Taste Profile Overview */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-600 p-3 rounded-xl">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Qloo Taste AI™ Profile</h2>
            <p className="text-purple-700">Behavioral patterns mapped to travel preferences</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Music className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Music Taste</h3>
            </div>
            <div className="space-y-1">
              {tasteProfile.behaviorPatterns.musicListening.genres.slice(0, 3).map((genre, idx) => (
                <span key={idx} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-1">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Utensils className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Dining Style</h3>
            </div>
            <div className="space-y-1">
              {tasteProfile.behaviorPatterns.diningPreferences.cuisines.slice(0, 3).map((cuisine, idx) => (
                <span key={idx} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-1">
                  {cuisine}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <Film className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Entertainment</h3>
            </div>
            <div className="space-y-1">
              {tasteProfile.behaviorPatterns.entertainmentChoices.movieGenres.slice(0, 3).map((genre, idx) => (
                <span key={idx} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-1">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-purple-100">
            <div className="flex items-center space-x-2 mb-2">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Shopping</h3>
            </div>
            <div className="space-y-1">
              {tasteProfile.behaviorPatterns.shoppingBehavior.brands.slice(0, 3).map((brand, idx) => (
                <span key={idx} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-1">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Behavior to Travel Connections */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-600 p-3 rounded-xl">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Behavioral Insights</h2>
            <p className="text-blue-700">How your daily choices predict travel preferences</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {behaviorInsights.map((insight, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="bg-white p-2 rounded-lg">
                  {getCategoryIcon(insight.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{insight.category}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Behavior:</strong> {insight.behavior}
                  </p>
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>Travel Connection:</strong> {insight.travelConnection}
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600">Examples:</p>
                    {insight.examples.map((example, idx) => (
                      <span key={idx} className="inline-block bg-white text-gray-700 text-xs px-2 py-1 rounded mr-1">
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Taste Graph Connections */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-600 p-3 rounded-xl">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Taste Graph Connections</h2>
            <p className="text-green-700">Neural pathways linking your preferences to destinations</p>
          </div>
        </div>

        <div className="space-y-4">
          {tasteConnections.map((connection, index) => (
            <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center space-x-4">
                <div className="bg-white px-3 py-2 rounded-lg font-medium text-gray-900">
                  {connection.from}
                </div>
                <div className="flex-1 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStrengthColor(connection.strength)}`}
                      style={{ width: `${connection.strength * 100}%` }}
                    ></div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-500" />
                </div>
                <div className="bg-white px-3 py-2 rounded-lg font-medium text-gray-900">
                  {connection.to}
                </div>
                <div className="text-sm font-medium text-green-700">
                  {Math.round(connection.strength * 100)}%
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3 ml-4">
                {connection.reasoning}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Affinity Scores */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-amber-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-amber-600 p-3 rounded-xl">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cultural Affinity Scores</h2>
            <p className="text-amber-700">Predicted alignment with different cultural experiences</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(tasteProfile.tasteGraph.affinityScores)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6)
            .map(([category, score]) => (
            <div key={category} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 capitalize">{category}</h3>
                <span className="text-amber-700 font-bold">{Math.round(score * 100)}%</span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${score * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};