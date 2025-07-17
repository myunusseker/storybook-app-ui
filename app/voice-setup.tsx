import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Mic, ArrowLeft, CircleCheck as CheckCircle, Play, Pause, RotateCcw, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const recordingPhrases = [
  "Once upon a time, in a magical kingdom far away...",
  "The little dragon loved to read bedtime stories to all the forest animals.",
  "Luna looked up at the sparkling stars and made a wish.",
  "The friendly giant lived in a castle made of clouds.",
  "Every night, the moon would tell stories to the sleeping world below."
];

export default function VoiceSetupScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedPhrases, setRecordedPhrases] = useState<boolean[]>(new Array(5).fill(false));
  const [isPlaying, setIsPlaying] = useState(false);

  const handleRecord = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      const newRecorded = [...recordedPhrases];
      newRecorded[currentStep] = true;
      setRecordedPhrases(newRecorded);
    } else {
      // Start recording
      setIsRecording(true);
    }
  };

  const handleNext = () => {
    if (currentStep < recordingPhrases.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete setup
      router.back();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlayback = () => {
    setIsPlaying(!isPlaying);
    // Simulate playback
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const isStepComplete = recordedPhrases[currentStep];
  const allComplete = recordedPhrases.every(recorded => recorded);

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Setup</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentStep + 1) / recordingPhrases.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {recordingPhrases.length}
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.stepTitle}>Record Your Voice</Text>
        <Text style={styles.stepDescription}>
          Read this phrase naturally in your storytelling voice
        </Text>

        <View style={styles.phraseContainer}>
          <Text style={styles.phraseText}>
            "{recordingPhrases[currentStep]}"
          </Text>
        </View>

        <View style={styles.recordingContainer}>
          <TouchableOpacity 
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
              isStepComplete && styles.recordButtonComplete
            ]}
            onPress={handleRecord}
          >
            {isStepComplete ? (
              <CheckCircle size={40} color="#ffffff" />
            ) : (
              <Mic size={40} color="#ffffff" />
            )}
          </TouchableOpacity>
          
          <View style={styles.recordingInfo}>
            <Text style={styles.recordingStatus}>
              {isRecording ? 'Recording...' : 
               isStepComplete ? 'Recorded!' : 'Tap to record'}
            </Text>
            {isRecording && (
              <View style={styles.recordingAnimation}>
                <View style={styles.recordingDot} />
                <View style={styles.recordingDot} />
                <View style={styles.recordingDot} />
              </View>
            )}
          </View>
        </View>

        {isStepComplete && (
          <View style={styles.playbackContainer}>
            <TouchableOpacity 
              style={styles.playbackButton}
              onPress={handlePlayback}
            >
              {isPlaying ? (
                <Pause size={20} color="#8b5cf6" />
              ) : (
                <Play size={20} color="#8b5cf6" />
              )}
              <Text style={styles.playbackText}>
                {isPlaying ? 'Playing...' : 'Play Recording'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                const newRecorded = [...recordedPhrases];
                newRecorded[currentStep] = false;
                setRecordedPhrases(newRecorded);
              }}
            >
              <RotateCcw size={16} color="#ffffff" />
              <Text style={styles.retryText}>Re-record</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[
            styles.navButton,
            currentStep === 0 && styles.navButtonDisabled
          ]}
          onPress={handlePrevious}
          disabled={currentStep === 0}
        >
          <Text style={[
            styles.navButtonText,
            currentStep === 0 && styles.navButtonTextDisabled
          ]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.navButton,
            styles.navButtonPrimary,
            !isStepComplete && styles.navButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!isStepComplete}
        >
          <Text style={[
            styles.navButtonText,
            styles.navButtonTextPrimary,
            !isStepComplete && styles.navButtonTextDisabled
          ]}>
            {currentStep === recordingPhrases.length - 1 ? 'Complete' : 'Next'}
          </Text>
          <ArrowRight size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.dotsContainer}>
        {recordingPhrases.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentStep && styles.dotActive,
              recordedPhrases[index] && styles.dotComplete
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 40,
  },
  phraseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 40,
    width: '100%',
  },
  phraseText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  recordButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  recordButtonComplete: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  recordingInfo: {
    alignItems: 'center',
  },
  recordingStatus: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 10,
  },
  recordingAnimation: {
    flexDirection: 'row',
    gap: 5,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    opacity: 0.7,
  },
  playbackContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  playbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 25,
  },
  playbackText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  retryText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  navButtonPrimary: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  navButtonTextPrimary: {
    color: '#8b5cf6',
  },
  navButtonTextDisabled: {
    opacity: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: '#ffffff',
  },
  dotComplete: {
    backgroundColor: '#10b981',
  },
});