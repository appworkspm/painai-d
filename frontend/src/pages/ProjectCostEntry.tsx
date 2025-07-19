import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Button, DatePicker, Select, message } from 'antd';
import { projectCostAPI } from '../services/api';
import dayjs from 'dayjs';

const COST_CATEGORIES = [
  { value: 'direct', label: 'ต้นทุนตรง (ค่าแรง, วัสดุ, เครื่องจักร)' },
  { value: 'indirect', label: 'ต้นทุนทางอ้อม (สำนักงาน, บริหาร)' },
  { value: 'labor', label: 'ค่าแรง (จาก timesheet หรือ manual)' },
  { value: 'material', label: 'ค่าวัสดุ' },
  { value: 'subcontract', label: 'ผู้รับเหมาช่วง' },
  { value: 'overhead', label: 'ค่าใช้จ่ายทั่วไป' },
  { value: 'equipment', label: 'ค่าเครื่องมือ/เครื่องจักร' },
  { value: 'travel', label: 'ค่าเดินทาง' },
  { value: 'other', label: 'อื่น ๆ' },
];

const ProjectCostEntry = ({ projectId }: { projectId: string }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await projectCostAPI.createProjectCost({
        ...values,
        projectId,
        date: values.date.format('YYYY-MM-DD'),
      });
      message.success('บันทึกค่าใช้จ่ายสำเร็จ');
      form.resetFields();
    } catch (e) {
      message.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="บันทึกค่าใช้จ่ายโครงการ" style={{ maxWidth: 500, margin: '0 auto' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
          <Button type="primary" htmlType="submit" loading={loading} block>
            บันทึกค่าใช้จ่าย
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProjectCostEntry;
