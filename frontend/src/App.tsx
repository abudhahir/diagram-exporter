import { useState } from 'react';
import { MantineProvider, AppShell, Title, Text, Container, Paper, TextInput, Button, Group, Loader, ScrollArea, TypographyStylesProvider } from '@mantine/core';
import Markdown from 'react-markdown';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setReview('');
    setError('');
    
    try {
      const response = await fetch('http://localhost:3000/api/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setReview(data.review);
      } else {
        setError(data.error || 'Failed to generate review');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <MantineProvider defaultColorScheme="dark">
      <AppShell header={{ height: 60 }} padding="md">
        <AppShell.Header p="md">
          <Title order={3}>GCP UI - Copilot Code Reviewer</Title>
        </AppShell.Header>

        <AppShell.Main>
          <Container size="lg" pt="xl">
            <Paper shadow="xl" p="xl" radius="md" withBorder style={{ background: 'rgba(24, 26, 27, 0.6)', backdropFilter: 'blur(10px)' }}>
              <Title order={2} mb="md" style={{ background: '-webkit-linear-gradient(45deg, #4dabf7, #9775fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Automated Code Review
              </Title>
              <Text c="dimmed" mb="lg">
                Enter a GitHub or GitLab Pull/Merge Request URL below to generate an automated code review using the GitHub Copilot SDK.
              </Text>
              
              <Group align="flex-end" mb="xl">
                <TextInput
                  label="Pull/Merge Request URL"
                  placeholder="https://github.com/owner/repo/pull/123"
                  style={{ flex: 1 }}
                  size="md"
                  value={url}
                  onChange={(e) => setUrl(e.currentTarget.value)}
                  disabled={loading}
                />
                <Button 
                  size="md" 
                  variant="gradient" 
                  gradient={{ from: 'indigo', to: 'cyan' }}
                  onClick={handleAnalyze}
                  loading={loading}
                  disabled={!url.trim()}
                >
                  Analyze PR
                </Button>
              </Group>

              {error && (
                <Text c="red" mb="md" fw={500}>{error}</Text>
              )}

              {loading && !review && (
                <Group justify="center" p="xl">
                  <Loader color="cyan" type="bars" />
                  <Text ml="md">Cloning repo, checking out PR, and analyzing diffs with GitHub Copilot...</Text>
                </Group>
              )}

              {review && (
                <Paper p="md" radius="md" withBorder bg="dark.8">
                  <Title order={4} mb="md">Code Review Results</Title>
                  <ScrollArea h={500} offsetScrollbars type="auto">
                    <TypographyStylesProvider>
                      <Markdown>{review}</Markdown>
                    </TypographyStylesProvider>
                  </ScrollArea>
                </Paper>
              )}
            </Paper>
          </Container>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
