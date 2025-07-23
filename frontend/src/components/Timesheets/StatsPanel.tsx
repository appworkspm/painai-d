import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { motion } from 'framer-motion';
import { StatsPanelProps } from './types';
import { formatHours } from './utils';
import { ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import './StatsPanel.css';

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, loading }) => {
  const statCards = [
    {
      title: 'Total Hours',
      value: formatHours(stats.totalHours),
      icon: <ClockCircleOutlined className="stat-icon" />,
      color: '#1890ff',
      key: 'totalHours',
    },
    {
      title: 'This Week',
      value: formatHours(stats.thisWeekHours),
      icon: <CalendarOutlined className="stat-icon" />,
      color: '#52c41a',
      key: 'thisWeek',
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: <CheckCircleOutlined className="stat-icon" />,
      color: '#52c41a',
      key: 'approved',
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      icon: <ExclamationCircleOutlined className="stat-icon" />,
      color: '#faad14',
      key: 'pending',
    },
  ];

  return (
    <div className="stats-panel">
      <Row gutter={[16, 16]}>
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={stat.key}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className="stat-card" 
                loading={loading}
                hoverable
              >
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.icon}
                  valueStyle={{ color: stat.color }}
                />
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default StatsPanel;
