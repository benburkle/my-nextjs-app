'use client';

import { useEffect, useState } from 'react';
import { Box, Text, Loader, Group, ActionIcon, Popover } from '@mantine/core';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { IconInfoCircle, IconBook } from '@tabler/icons-react';

interface SessionStepInsightsEditorProps {
  content: string | null;
  onChange: (html: string) => void;
  instructions?: string | null;
  example?: string | null;
}

export function SessionStepInsightsEditor({
  content,
  onChange,
  instructions,
  example,
}: SessionStepInsightsEditorProps) {
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, TaskList, TaskItem],
    content: content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!editor || !mounted) return;
    const currentContent = editor.getHTML();
    if (currentContent !== (content || '')) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor, mounted]);

  if (!mounted || !editor) {
    return (
      <Box>
        <Group gap="xs" mb={5}>
          <Text size="sm" fw={500}>
            Insights
          </Text>
          {instructions && (
            <ActionIcon variant="subtle" size="sm" color="blue" disabled>
              <IconInfoCircle size={16} />
            </ActionIcon>
          )}
          {example && (
            <ActionIcon variant="subtle" size="sm" color="blue" disabled>
              <IconBook size={16} />
            </ActionIcon>
          )}
        </Group>
        <Box
          style={{
            minHeight: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Loader size="sm" />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Group gap="xs" mb={5}>
        <Text size="sm" fw={500}>
          Insights
        </Text>
        {instructions && (
          <Popover width={400} position="top" withArrow shadow="md">
            <Popover.Target>
              <ActionIcon variant="subtle" size="sm" color="blue">
                <IconInfoCircle size={16} />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="sm" fw={500} mb="xs">
                Instructions
              </Text>
              <Box
                style={{ textAlign: 'left', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: instructions }}
              />
            </Popover.Dropdown>
          </Popover>
        )}
        {example && (
          <Popover width={400} position="top" withArrow shadow="md">
            <Popover.Target>
              <ActionIcon variant="subtle" size="sm" color="blue">
                <IconBook size={16} />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="sm" fw={500} mb="xs">
                Example
              </Text>
              <Box
                style={{ textAlign: 'left', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: example }}
              />
            </Popover.Dropdown>
          </Popover>
        )}
      </Group>
      <RichTextEditor editor={editor} style={{ minHeight: 200 }}>
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Highlight />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.TaskList />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignJustify />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content />
      </RichTextEditor>
    </Box>
  );
}
