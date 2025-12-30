import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import {
  Text,
  Input,
  Button,
  Card,
  Overlay,
  Icon,
} from '@rneui/themed';
import { useRoute, useNavigation } from '@react-navigation/native';
import { sessionsService } from '../../services/sessionsService';

interface GuideStep {
  id: number;
  name: string;
  instructions: string | null;
  example: string | null;
  index: number;
}

interface SessionStep {
  id: number;
  guideStepId: number;
  insights: string | null;
  guideStep: GuideStep;
}

interface Session {
  id: number;
  date: string | null;
  time: string | null;
  insights: string | null;
  reference: string | null;
  sessionSteps?: SessionStep[];
  study?: {
    id: number;
    name: string;
    guide?: {
      name: string;
    };
  };
}

export default function SessionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params as { id: number | string; studyId?: number };
  const { id, studyId } = params;
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reference, setReference] = useState('');
  const [insights, setInsights] = useState('');
  const [instructionsModalVisible, setInstructionsModalVisible] = useState(false);
  const [exampleModalVisible, setExampleModalVisible] = useState(false);
  const [currentInstructions, setCurrentInstructions] = useState<string | null>(null);
  const [currentExample, setCurrentExample] = useState<string | null>(null);
  const [stepInsights, setStepInsights] = useState<Record<number, string>>({});

  useEffect(() => {
    if (id && id !== 'new') {
      loadSession();
    } else {
      setLoading(false);
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toTimeString().slice(0, 5));
    }
  }, [id]);

  const loadSession = async () => {
    try {
      const data = await sessionsService.getSession(id);
      setSession(data);
      setDate(data.date ? new Date(data.date).toISOString().split('T')[0] : '');
      setTime(data.time ? new Date(data.time).toTimeString().slice(0, 5) : '');
      setReference(data.reference || '');
      setInsights(data.insights || '');
      
      // Load step insights
      if (data.sessionSteps) {
        const insightsMap: Record<number, string> = {};
        data.sessionSteps.forEach((step) => {
          if (step.insights) {
            insightsMap[step.id] = step.insights;
          }
        });
        setStepInsights(insightsMap);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dateTime = date && time ? `${date}T${time}:00` : null;
      const dateOnly = date ? `${date}T00:00:00` : null;

      if (id && id !== 'new') {
        await sessionsService.updateSession(id, {
          date: dateOnly,
          time: dateTime,
          insights: insights || null,
          reference: reference || null,
        });
      } else if (studyId) {
        await sessionsService.createSession(studyId, {
          date: dateOnly,
          time: dateTime,
          insights: insights || null,
          reference: reference || null,
        });
      }

      // Update session step insights
      if (session?.sessionSteps) {
        const updatePromises = session.sessionSteps.map((step) => {
          const stepInsight = stepInsights[step.id];
          if (stepInsight !== undefined) {
            return sessionsService.updateSessionStep(step.id, stepInsight || null);
          }
          return Promise.resolve();
        });
        await Promise.all(updatePromises);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Failed to save session:', error);
    } finally {
      setSaving(false);
    }
  };

  const getTotalSteps = () => {
    return (session?.sessionSteps?.length || 0) + 1; // +1 for Session Details
  };

  const getCurrentSessionStep = () => {
    if (activeStep < 1 || !session?.sessionSteps) return null;
    return session.sessionSteps[activeStep - 1];
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const currentStep = getCurrentSessionStep();
  const totalSteps = getTotalSteps();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button
          icon={<Icon name="arrow-back" />}
          onPress={() => navigation.goBack()}
          type="clear"
          title="Back"
        />
        <Text h3>
          {id && id !== 'new' ? 'Edit Session' : 'New Session'}
        </Text>
        {session?.study && (
          <View style={styles.studyInfo}>
            <Text>Study: {session.study.name}</Text>
            {session.study.guide && (
              <Text style={{ fontSize: 12 }}>Guide: {session.study.guide.name}</Text>
            )}
          </View>
        )}
      </View>

      {/* Stepper */}
      {session?.sessionSteps && session.sessionSteps.length > 0 && (
        <View style={styles.stepperContainer}>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={[styles.stepButton, activeStep === 0 && styles.stepButtonActive]}
              onPress={() => setActiveStep(0)}
            >
              <Text style={[styles.stepText, activeStep === 0 && styles.stepTextActive]}>
                0
              </Text>
            </TouchableOpacity>
            {session.sessionSteps.map((step, index) => (
              <TouchableOpacity
                key={step.id}
                style={[styles.stepButton, activeStep === index + 1 && styles.stepButtonActive]}
                onPress={() => setActiveStep(index + 1)}
              >
                <Text style={[styles.stepText, activeStep === index + 1 && styles.stepTextActive]}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Session Details Step */}
      {activeStep === 0 && (
        <Card containerStyle={styles.card}>
          <Text h4 style={styles.sectionTitle}>
            Session Details
          </Text>
          <Input
            label="Date"
            value={date}
            onChangeText={setDate}
            containerStyle={styles.input}
          />
          <Input
            label="Time"
            value={time}
            onChangeText={setTime}
            containerStyle={styles.input}
          />
          <Input
            label="Reference"
            value={reference}
            onChangeText={setReference}
            containerStyle={styles.input}
            multiline
          />
          <Input
            label="Insights"
            value={insights}
            onChangeText={setInsights}
            containerStyle={styles.input}
            inputStyle={[styles.textArea]}
            multiline
            numberOfLines={8}
          />
        </Card>
      )}

      {/* Session Step Content */}
      {activeStep > 0 && currentStep && (
        <Card containerStyle={styles.card}>
          <View style={styles.stepHeader}>
            <Text h4>{currentStep.guideStep.name}</Text>
            <View style={styles.iconRow}>
              {currentStep.guideStep.instructions && (
                <Button
                  icon={<Icon name="info" />}
                  type="clear"
                  title="Instructions"
                  onPress={() => {
                    setCurrentInstructions(currentStep.guideStep.instructions);
                    setInstructionsModalVisible(true);
                  }}
                />
              )}
              {currentStep.guideStep.example && (
                <Button
                  icon={<Icon name="lightbulb" />}
                  type="clear"
                  title="Example"
                  onPress={() => {
                    setCurrentExample(currentStep.guideStep.example);
                    setExampleModalVisible(true);
                  }}
                />
              )}
            </View>
          </View>
          <Input
            label="Insights"
            value={stepInsights[currentStep.id] || ''}
            onChangeText={(text) =>
              setStepInsights({ ...stepInsights, [currentStep.id]: text })
            }
            containerStyle={styles.input}
            inputStyle={[styles.textArea]}
            multiline
            numberOfLines={10}
          />
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          type="outline"
          onPress={() => navigation.goBack()}
          buttonStyle={styles.button}
        />
        <Button
          title={id && id !== 'new' ? 'Update' : 'Create'}
          onPress={handleSave}
          loading={saving}
          buttonStyle={styles.button}
        />
      </View>

      {/* Modals */}
      <Overlay
        isVisible={instructionsModalVisible}
        onBackdropPress={() => setInstructionsModalVisible(false)}
        overlayStyle={styles.modalContent}
      >
        <Text h4 style={styles.modalTitle}>
          Instructions
        </Text>
        <ScrollView style={styles.modalScrollView}>
          <Text>{currentInstructions}</Text>
        </ScrollView>
        <Button
          title="Close"
          onPress={() => setInstructionsModalVisible(false)}
          buttonStyle={styles.modalButton}
        />
      </Overlay>

      <Overlay
        isVisible={exampleModalVisible}
        onBackdropPress={() => setExampleModalVisible(false)}
        overlayStyle={styles.modalContent}
      >
        <Text h4 style={styles.modalTitle}>
          Example
        </Text>
        <ScrollView style={styles.modalScrollView}>
          <Text>{currentExample}</Text>
        </ScrollView>
        <Button
          title="Close"
          onPress={() => setExampleModalVisible(false)}
          buttonStyle={styles.modalButton}
        />
      </Overlay>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  studyInfo: {
    marginTop: 10,
  },
  stepperContainer: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  stepHeader: {
    marginBottom: 15,
  },
  iconRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  input: {
    marginBottom: 15,
  },
  textArea: {
    minHeight: 200,
    textAlignVertical: 'top',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  stepButtonActive: {
    backgroundColor: '#007AFF',
  },
  stepText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepTextActive: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  modalContent: {
    padding: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    marginBottom: 15,
  },
  modalScrollView: {
    maxHeight: 300,
    marginBottom: 15,
  },
  modalButton: {
    marginTop: 10,
  },
});
