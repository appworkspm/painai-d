import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Statistic, Row, Col, DatePicker, Select } from 'antd';
import { projectCostAPI } from '../services/api';
import dayjs from 'dayjs';

const COST_CATEGORIES = [
  { value: 'direct', label: 'ต้นทุนตรง' },
  { value: 'indirect', label: 'ต้นทุนทางอ้อม' },
  { value: 'labor', label: 'ค่าแรง' },
  { value: 'material', label: 'ค่าวัสดุ' },
  { value: 'subcontract', label: 'ผู้รับเหมาช่วง' },
  { value: 'overhead', label: 'ค่าใช้จ่ายทั่วไป' },
  { value: 'equipment', label: 'ค่าเครื่องมือ/เครื่องจักร' },
  { value: 'travel', label: 'ค่าเดินทาง' },
  { value: 'other', label: 'อื่น ๆ' },
];

const ProjectCostReport = ({ projectId }: { projectId: string }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [projectId, category]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await projectCostAPI.getProjectCosts({ projectId, category });
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'วันที่', dataIndex: 'date', key: 'date', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    { title: 'ชื่อรายการ', dataIndex: 'title', key: 'title' },
    { title: 'หมวดหมู่', dataIndex: 'category', key: 'category', render: (c: string) => {
      const cat = COST_CATEGORIES.find(cat => cat.value === c);
      return <Tag color="blue">{cat ? cat.label : c}</Tag>;
    } },
    { title: 'จำนวนเงิน (บาท)', dataIndex: 'amount', key: 'amount', align: 'right', render: (a: number) => a?.toLocaleString() },
    { title: 'รายละเอียด', dataIndex: 'description', key: 'description' },
  ];

  const total = data.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  return (
    <Card title="รายงานสรุปค่าใช้จ่ายโครงการ" style={{ maxWidth: 900, margin: '0 auto' }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Statistic title="รวมค่าใช้จ่าย" value={total} suffix="บาท" valueStyle={{ color: '#f59e42' }} />
        </Col>
        <Col span={8}>
          <Select
            allowClear
            placeholder="เลือกหมวดหมู่"
            style={{ width: '100%' }}
            options={COST_CATEGORIES}
            value={category}
            onChange={setCategory}
          />
        </Col>
      </Row>
      <Table columns={columns} dataSource={data} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
    </Card>
  );
};

export default ProjectCostReport;
