"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import VideoResult from '@/components/VideoResult';
import { Download, Save } from 'lucide-react';

const VideoGenerationPage = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jsonPath, setJsonPath] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  // Function to save video data to JSON
  const saveVideoData = async () => {
    if (!result) return;
    
    setSaveStatus('saving');
    
    try {
      const response = await axios.post('/api/video/save', { 
        videoData: result,
        prompt: prompt
      });
      
      setJsonPath(response.data.jsonFilePath);
      setSaveStatus('saved');
    } catch (error) {
      console.error('Error saving video:', error);
      setSaveStatus('error');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveStatus(null);
    setJsonPath(null);

    try {
      const response = await axios.post('/api/video', { prompt });
      setResult(response.data.video);
      
      // If the API already saved the JSON file
      if (response.data.jsonFilePath) {
        setJsonPath(response.data.jsonFilePath);
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Failed to generate video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Video Generation</h1>
        <p className="text-gray-600">Enter a prompt to generate a short video</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
            Prompt
          </label>
          <textarea
            id="prompt"
            rows={4}
            className="mt-1 w-full rounded-md border border-gray-300 shadow-sm p-2"
            placeholder="Describe the video you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Video'}
        </button>
      </form>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Result</h2>
          
          {/* Save Video Button */}
          {result && result.status === "succeeded" && !jsonPath && (
            <button
              onClick={saveVideoData}
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saveStatus === 'saving' ? 'Saving...' : 'Save Video Data'}
            </button>
          )}
        </div>
        
        <VideoResult result={result} />
        
        {/* JSON file path information */}
        {jsonPath && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700">Video data saved</p>
                <p className="text-sm text-gray-500">Your video data is saved and can be accessed later</p>
              </div>
              <a 
                href={jsonPath}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
              >
                <Download size={16} />
                JSON Data
              </a>
            </div>
          </div>
        )}
        
        {/* Prompt enhancement tips */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Pro tips for better videos</h3>
          <p className="text-sm text-blue-700 mb-2">
            Add these keywords to enhance your videos:
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
            <div>
              <span className="font-medium">Styles:</span> anime, cartoon, realistic, cinematic
            </div>
            <div>
              <span className="font-medium">Settings:</span> space, forest, city, beach
            </div>
            <div>
              <span className="font-medium">Time:</span> night, sunset, morning
            </div>
            <div>
              <span className="font-medium">Motion:</span> running, flying, swimming, dancing
            </div>
          </div>
        </div>
      </div>
      
      {/* Video history section */}
      {result && result.status === "succeeded" && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-2">Video Details</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><span className="font-medium">Video ID:</span> {result.id}</p>
            <p><span className="font-medium">Created:</span> {new Date(result.created_at).toLocaleString()}</p>
            <p><span className="font-medium">Original Prompt:</span> {prompt}</p>
            <p><span className="font-medium">Enhanced Prompt:</span> {result.input?.prompt}</p>
            {result.metrics && (
              <p><span className="font-medium">Generation Time:</span> {result.metrics.predict_time.toFixed(2)} seconds</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGenerationPage;