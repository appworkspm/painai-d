import React, { useState } from 'react';
import { useGemini } from '../hooks/useGemini';
import { Button, Input, Card, Space, Typography, Alert } from 'antd';

const { TextArea } = Input;
const { Title } = Typography;

export const GeminiChat: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const { generate, response, isLoading, error } = useGemini();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    try {
      await generate(prompt);
    } catch (err) {
      console.error('Error generating response:', err);
    }
  };

  return (
    <Card 
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>AI Assistant</Title>
        </Space>
      }
      style={{ maxWidth: 800, margin: '0 auto' }}
    >
      <form onSubmit={handleSubmit}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="ถามอะไรก็ได้..."
              autoSize={{ minRows: 3, maxRows: 6 }}
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isLoading}
            disabled={!prompt.trim()}
          >
            Generate Response
          </Button>

          {error && (
            <Alert
              message="Error"
              description={error.message}
              type="error"
              showIcon
              closable
              onClose={() => {}}
            />
          )}

          {response && (
            <div>
              <Title level={5}>Response:</Title>
              <Card style={{ background: '#f9f9f9' }}>
                {response}
              </Card>
            </div>
          )}
        </Space>
      </form>
    </Card>
  );
};
