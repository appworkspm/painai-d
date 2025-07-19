import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, DatePicker, Select, message } from 'antd';
import { costRequestAPI } from '../services/api';
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

const MyCostRequests = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await costRequestAPI.getCostRequests();
      setData(res.data || []);
    } finally { setLoading(false); }
  };

  const handleCreate = async (values: any) => {
    try {
      await costRequestAPI.createCostRequest({
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      });
      message.success('ส่งคำขอค่าใช้จ่ายสำเร็จ');
      setShowModal(false);
      form.resetFields();
      fetchData();
    } catch {
      message.error('เกิดข้อผิดพลาด');
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
    { title: 'สถานะ', dataIndex: 'status', key: 'status', render: (s: string) => {
      if (s === 'PENDING') return <Tag color="orange">รออนุมัติ</Tag>;
      if (s === 'APPROVED') return <Tag color="green">อนุมัติแล้ว</Tag>;
      if (s === 'REJECTED') return <Tag color="red">ไม่อนุมัติ</Tag>;
      return s;
    } },
    { title: 'หมายเหตุ', dataIndex: 'rejectionReason', key: 'rejectionReason' },
  ];

  return (
    <Card title="My Cost Requests" extra={<Button type="primary" onClick={()=>setShowModal(true)}>ขออนุมัติค่าใช้จ่าย</Button>}>
      <Table columns={columns} dataSource={data} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
      <Modal open={showModal} onCancel={()=>setShowModal(false)} title="ขออนุมัติค่าใช้จ่าย" footer={null}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="date" label="วันที่" rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}> 
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="category" label="หมวดหมู่" rules={[{ required: true, message: 'กรุณาเลือกหมวดหมู่' }]}> 
            <Select options={COST_CATEGORIES} placeholder="เลือกหมวดหมู่ค่าใช้จ่าย" />
          </Form.Item>
          <Form.Item name="title" label="ชื่อรายการ" rules={[{ required: true, message: 'กรุณากรอกชื่อรายการ' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="จำนวนเงิน (บาท)" rules={[{ required: true, message: 'กรุณากรอกจำนวนเงิน' }]}> 
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="รายละเอียดเพิ่มเติม">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>ส่งคำขอ</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default MyCostRequests;
