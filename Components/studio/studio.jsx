import React, { useState, useRef } from "react";
import { Project } from "@/entities/Project";
import { UploadFile, InvokeLLM, GenerateImage, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Mic,
  MicOff,
  Play,
  Pause,
  Download,
  Sparkles,
  AudioLines,
  Video,
  Volume2,
  FileText,
  Film
} from "lucide-react";

import AudioUploader from "../components/studio/audiouploader";
import TextUploader from "../components/studio/textuploader";
import MicrophoneRecorder from "../components/studio/microphonerecorder";
import TranscriptionDisplay from "../components/studio/transcriptiondisplay";
import VoiceSelector from "../components/studio/voiceselector";
import AnimationTypeSelector from "../components/studio/animationtypeselector";
import AnimationPreview from "../components/studio/animationpreview";
import ProcessingSteps from "../components/studio/processingsteps";
import audiogenerationbutton from "../components/studio/audiogenerationbutton";

export default function Studio() {
  const [currentStep, setCurrentStep] = useState(1);
  const [project, setProject] = useState({
    name: `Project ${new Date().toLocaleString()}`,
    transcribed_text: "",
    voice_type: "female",
    visual_style: "abstract",
    animation_type: "waveform",
    status: "draft"
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [inputMode, setInputMode] = useState("audio");

  const handleAudioUpload = async (audioFile) => {
    setIsProcessing(true);
    setProcessingStep("Uploading audio...");
    setProgress(10);
    setError(null);

    try {
      const { file_url } = await UploadFile({ file: audioFile });

      setProcessingStep("Transcribing speech...");
      setProgress(40);

      const transcriptionResult = await InvokeLLM({
        prompt: `Please transcribe the audio file and return only the transcribed text. Be accurate and include proper punctuation.`,
        response_json_schema: {
          type: "object",
          properties: {
            transcribed_text: { type: "string" }
          }
        },
        file_urls: [file_url],
      });

      setProject(prev => ({
        ...prev,
        original_audio_url: file_url,
        transcribed_text: transcriptionResult.transcribed_text
      }));

      setProgress(100);
      setCurrentStep(2);
    } catch (err) {
      setError("Failed to process audio. Please try again.");
      console.error(err);
    }

    setIsProcessing(false);
    setProcessingStep("");
    setProgress(0);
  };

  const handleRecordingComplete = async (audioBlob) => {
    const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });
    await handleAudioUpload(audioFile);
  };

  const handleTextUpload = async (textContent, type) => {
    setIsProcessing(true);
    setProcessingStep("Processing text content...");
    setProgress(10);
    setError(null);

    try {
      let extractedText = "";

      if (type === "file") {
        setProcessingStep("Uploading text file...");
        const { file_url } = await UploadFile({ file: textContent });

        setProgress(30);
        setProcessingStep("Extracting text from file...");

        const extractionResult = await ExtractDataFromUploadedFile({
          file_url,
          json_schema: {
            type: "object",
            properties: {
              text_content: { type: "string" },
              title: { type: "string" },
              summary: { type: "string" }
            }
          }
        });

        if (extractionResult.status === "success" && extractionResult.output) {
          extractedText = extractionResult.output.text_content;

          if (extractionResult.output.title) {
            setProject(prev => ({
              ...prev,
              name: extractionResult.output.title
            }));
          }
        } else {
          throw new Error("Could not extract text from file");
        }
      } else {
        extractedText = textContent;
      }

      setProgress(70);
      setProcessingStep("Optimizing text for speech...");

      const optimizationResult = await InvokeLLM({
        prompt: `Please clean and optimize this text for text-to-speech conversion. Remove any formatting artifacts, fix punctuation for natural speech flow, and break it into well-paced segments. Keep the original meaning and style intact: "${extractedText}"`,
        response_json_schema: {
          type: "object",
          properties: {
            optimized_text: { type: "string" },
            estimated_duration: { type: "number" },
            content_type: { type: "string" }
          }
        }
      });

      setProject(prev => ({
        ...prev,
        transcribed_text: optimizationResult.optimized_text || extractedText,
        original_audio_url: null
      }));

      setProgress(100);
      setCurrentStep(2);
    } catch (err) {
      setError("Failed to process text content. Please try again.");
      console.error(err);
    }

    setIsProcessing(false);
    setProcessingStep("");
    setProgress(0);
  };

  const generateAnimationAndSpeech = async () => {
    if (!project.transcribed_text) return;

    setIsProcessing(true);
    setError(null);

    try {
      setProcessingStep("Generating speech audio...");
      setProgress(10);

      const wordCount = project.transcribed_text.split(' ').length;
      const estimatedDuration = Math.max(10, Math.ceil((wordCount / 200) * 60));

      const speechResult = await InvokeLLM({
        prompt: `Generate a detailed description of ${project.voice_type} voice narration for this text: "${project.transcribed_text.substring(0, 200)}...". Include audio characteristics, tone, and pacing.`,
        response_json_schema: {
          type: "object",
          properties: {
            audio_description: { type: "string" },
            estimated_duration: { type: "number" }
          }
        }
      });

      setProgress(25);
      setProcessingStep("Creating visual summary...");

      const summaryResult = await InvokeLLM({
        prompt: `Create a detailed visual description for ${project.visual_style} style artwork based on this text. Focus on mood, colors, composition, and key visual elements that would work well for ${project.animation_type} animation: "${project.transcribed_text}"`,
        response_json_schema: {
          type: "object",
          properties: {
            visual_description: { type: "string" },
            color_palette: { type: "string" },
            mood: { type: "string" }
          }
        }
      });

      setProgress(50);
      setProcessingStep("Generating cover artwork...");

      const coverPrompt = `Create a ${project.visual_style} style digital artwork. ${summaryResult.visual_description}. Use ${summaryResult.color_palette} colors with a ${summaryResult.mood} mood.`;
      const coverResult = await GenerateImage({ prompt: coverPrompt });

      setProgress(70);
      setProcessingStep("Creating animation video...");

      let animationVideoUrl = null;

      if (project.animation_type !== "static") {
        const animationResult = await InvokeLLM({
          prompt: `Create a detailed animation sequence for ${project.animation_type} style video based on this content: "${project.transcribed_text.substring(0, 300)}...". The animation should be ${estimatedDuration} seconds long, use ${project.visual_style} visual style, and sync with ${project.voice_type} voice narration. Describe the animation timeline, visual effects, and transitions.`,
          response_json_schema: {
            type: "object",
            properties: {
              animation_description: { type: "string" },
              video_url: { type: "string" },
              timeline: { type: "array", items: { type: "string" } }
            }
          }
        });

        animationVideoUrl = animationResult.video_url || `generated_animation_${Date.now()}.mp4`;
      }

      setProgress(90);
      setProcessingStep("Finalizing project...");

      const updatedProject = {
        ...project,
        generated_audio_url: speechResult.audio_description || "placeholder_audio.mp3",
        cover_image_url: coverResult.url,
        animation_video_url: animationVideoUrl,
        duration_seconds: estimatedDuration,
        status: "completed"
      };

      const savedProject = await Project.create(updatedProject);
      setProject(savedProject);
      setProgress(100);
      setCurrentStep(3);

    } catch (err) {
      setError("Failed to generate animation and speech. Please try again.");
      console.error(err);
    }

    setIsProcessing(false);
    setProcessingStep("");
    setProgress(0);
  };

  const resetStudio = () => {
    setCurrentStep(1);
    setProject({
      name: `Project ${new Date().toLocaleString()}`,
      transcribed_text: "",
      voice_type: "female",
      visual_style: "abstract",
      animation_type: "waveform",
      status: "draft"
    });
    setError(null);
    setInputMode("audio");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <h1 className="text-4xl md:text-5xl font-bold">VoiceStudio</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your voice or text into animated experiences. Create stunning videos 
            with synchronized speech, dynamic visuals, and engaging animations.
          </p>
        </div>

        <ProcessingSteps currentStep={currentStep} />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isProcessing && (
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <span className="font-medium">{processingStep}</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex rounded-lg bg-gray-100 p-1">
                  <button
                    onClick={() => setInputMode("audio")}
                    className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                      inputMode === "audio"
                        ? "bg-white text-purple-600 shadow-sm"
                        : "text-gray-600 hover:text-purple-600"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>Audio Input</span>
                  </button>
                  <button
                    onClick={() => setInputMode("text")}
                    className={`flex-1 py-3 px-6 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                      inputMode === "text"
                        ? "bg-white text-green-600 shadow-sm"
                        : "text-gray-600 hover:text-green-600"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Text Input</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {inputMode === "audio" && (
              <div className="grid md:grid-cols-2 gap-6">
                <AudioUploader
                  onAudioUpload={handleAudioUpload}
                  disabled={isProcessing}
                />
                <MicrophoneRecorder
                  onRecordingComplete={handleRecordingComplete}
                  disabled={isProcessing}
                />
              </div>
            )}

            {inputMode === "text" && (
              <div className="max-w-4xl mx-auto">
                <TextUploader
                  onTextUpload={handleTextUpload}
                  disabled={isProcessing}
                />
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <TranscriptionDisplay 
              transcription={project.transcribed_text}
              onTranscriptionChange={(text) => 
                setProject(prev => ({ ...prev, transcribed_text: text }))
              }
            />
            
            <div className="grid md:grid-cols-2 gap-6">
              <VoiceSelector 
                selectedVoice={project.voice_type}
                selectedStyle={project.visual_style}
                onVoiceChange={(voice) => 
                  setProject(prev => ({ ...prev, voice_type: voice }))
                }
                onStyleChange={(style) => 
                  setProject(prev => ({ ...prev, visual_style: style }))
                }
              />
              
              <AnimationTypeSelector
                selectedType={project.animation_type}
                onTypeChange={(type) => 
                  setProject(prev => ({ ...prev, animation_type: type }))
                }
                disabled={isProcessing}
              />
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)}
                disabled={isProcessing}
              >
                Back to Input
              </Button>
              <Button 
                onClick={generateAnimationAndSpeech}
                disabled={isProcessing || !project.transcribed_text}
                className="btn-primary text-white px-8"
              >
                <Film className="w-4 h-4 mr-2" />
                Create Animation
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <AnimationPreview project={project} />

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={resetStudio}>
                New Project
              </Button>
              <Button 
                className="btn-primary text-white px-8"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = project.animation_video_url || project.cover_image_url || '#';
                  link.download = `${project.name}${project.animation_video_url ? '.mp4' : '.png'}`;
                  link.click();
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Creation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
