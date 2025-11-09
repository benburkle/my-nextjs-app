'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Group,
  Select,
  Loader,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';

// Helper function to get HTTP status descriptions
function getStatusDescription(status: number): string {
  const descriptions: Record<number, string> = {
    400: 'Bad Request - Invalid input data',
    401: 'Unauthorized - Authentication required',
    403: 'Forbidden - Access denied',
    404: 'Not Found - Resource does not exist',
    409: 'Conflict - Resource already exists',
    422: 'Unprocessable Entity - Validation error',
    500: 'Internal Server Error - Server error occurred',
    502: 'Bad Gateway - Upstream server error',
    503: 'Service Unavailable - Service temporarily unavailable',
  };
  return descriptions[status] || `HTTP ${status} error`;
}

interface Schedule {
  id: number;
  day: string;
  timeStart: string;
  repeats: string;
}

interface Resource {
  id: number;
  name: string;
  type: string;
}

interface Guide {
  id: number;
  name: string;
}

interface Study {
  id: number;
  name: string;
  scheduleId: number | null;
  resourceId: number | null;
  guideId: number | null;
  schedule: Schedule | null;
  resource: Resource | null;
  sessions: any[];
}

interface EditStudyModalProps {
  opened: boolean;
  onClose: () => void;
  study: Study | null;
  onSaved: () => void;
}

export function EditStudyModal({
  opened,
  onClose,
  study,
  onSaved,
}: EditStudyModalProps) {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    scheduleId: '',
    resourceId: '',
    guideId: '',
  });

  useEffect(() => {
    if (opened) {
      fetchOptions();
      if (study) {
        setFormData({
          name: study.name || '',
          scheduleId: study.scheduleId ? study.scheduleId.toString() : '',
          resourceId: study.resourceId ? study.resourceId.toString() : '',
          guideId: study.guideId ? study.guideId.toString() : '',
        });
      } else {
        setFormData({
          name: '',
          scheduleId: '',
          resourceId: '',
          guideId: '',
        });
      }
    }
  }, [study, opened]);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const [schedulesRes, resourcesRes, guidesRes] = await Promise.all([
        fetch('/api/schedules'),
        fetch('/api/resources'),
        fetch('/api/guides'),
      ]);

      if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json();
        setSchedules(schedulesData);
      }

      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setResources(resourcesData);
      }

      if (guidesRes.ok) {
        const guidesData = await guidesRes.json();
        setGuides(guidesData);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = study ? `/api/studies/${study.id}` : '/api/studies';
      const method = study ? 'PUT' : 'POST';

      const requestBody = {
        name: formData.name,
        scheduleId: formData.scheduleId || null,
        resourceId: formData.resourceId || null,
        guideId: formData.guideId || null,
      };

      console.log('Submitting study:', { url, method, body: requestBody });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        notifications.show({
          title: 'Success',
          message: study ? 'Study updated successfully' : 'Study created successfully',
          color: 'green',
        });
        onSaved();
        onClose();
      } else {
        // Clone response to read body multiple times if needed
        const responseClone = response.clone();
        let errorData: any = null;
        let errorMessage = `HTTP ${response.status}: ${response.statusText || 'Failed to save study'}`;
        
        try {
          // Try to parse JSON response first
          try {
            errorData = await responseClone.json();
            
            // Extract error message from parsed data
            if (errorData && typeof errorData === 'object') {
              errorMessage = 
                errorData.error || 
                errorData.details || 
                errorData.message ||
                errorMessage;
            }
          } catch (jsonError) {
            // If JSON parsing fails, try reading as text from original response
            try {
              const text = await response.text();
              if (text && text.trim()) {
                errorMessage = text;
              }
            } catch (textError) {
              console.error('Failed to read error response as text:', textError);
            }
          }
        } catch (readError) {
          console.error('Failed to read error response:', readError);
          errorMessage = `HTTP ${response.status}: ${response.statusText || 'Failed to read error response'}`;
        }
        
        // Build error log with explicit values - never log empty objects
        const errorLogEntries: any[] = [
          `Status: ${response.status}`,
          `Status Text: ${response.statusText || 'N/A'}`,
          `Status Description: ${getStatusDescription(response.status)}`,
        ];
        
        if (errorData !== null && errorData !== undefined) {
          if (typeof errorData === 'object') {
            const keys = Object.keys(errorData);
            if (keys.length > 0) {
              errorLogEntries.push(`Error Data: ${JSON.stringify(errorData)}`);
            } else {
              errorLogEntries.push('Error Data: Empty object {}');
            }
          } else {
            errorLogEntries.push(`Error Data: ${String(errorData)}`);
          }
        } else {
          errorLogEntries.push('Error Data: No error data (null/undefined)');
        }
        
        errorLogEntries.push(`Error Message: ${errorMessage}`);
        
        console.error('API Error Response:', errorLogEntries.join('\n'));
        console.error('API Error Response (structured):', {
          status: response.status,
          statusText: response.statusText,
          statusDescription: getStatusDescription(response.status),
          hasErrorData: errorData !== null && errorData !== undefined,
          errorDataKeys: errorData && typeof errorData === 'object' ? Object.keys(errorData) : [],
          errorMessage: errorMessage,
        });
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving study:', error);
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to save study',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleOptions = schedules.map((s) => ({
    value: s.id.toString(),
    label: `${s.day} ${s.timeStart} (${s.repeats})`,
  }));

  const resourceOptions = resources.map((r) => ({
    value: r.id.toString(),
    label: `${r.name} (${r.type})`,
  }));

  const guideOptions = guides.map((g) => ({
    value: g.id.toString(),
    label: g.name,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={study ? 'Edit Study' : 'New Study'}
      size="lg"
    >
      {loadingOptions ? (
        <Loader size="md" />
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Name"
              placeholder="Enter study name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              data-walkthrough="study-name-input"
            />
            <Select
              label="Schedule"
              placeholder="Select schedule (optional)"
              data={scheduleOptions}
              value={formData.scheduleId}
              onChange={(value) =>
                setFormData({ ...formData, scheduleId: value || '' })
              }
              searchable
              clearable
              data-walkthrough="study-schedule-select"
            />
            <Select
              label="Resource"
              placeholder="Select resource (optional)"
              data={resourceOptions}
              value={formData.resourceId}
              onChange={(value) =>
                setFormData({ ...formData, resourceId: value || '' })
              }
              searchable
              clearable
              data-walkthrough="study-resource-select"
            />
            <Select
              label="Guide"
              placeholder="Select guide (optional)"
              data={guideOptions}
              value={formData.guideId}
              onChange={(value) =>
                setFormData({ ...formData, guideId: value || '' })
              }
              searchable
              clearable
              data-walkthrough="study-guide-select"
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading} data-walkthrough="create-study-button">
                {study ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
