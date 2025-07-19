import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, message } from 'antd';
import { costRequestAPI } from '../services/api';
import dayjs from 'dayjs';

const CostApproval = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await costRequestAPI.getCostRequests({ status: 'PENDING' });
      setData(res.data || []);
    } finally { setLoading(false); }
  };

  const handleApprove = async (record: any) => {
    await costRequestAPI.approveCostRequest(record.id, { status: 'APPROVED' });
    message.success('อนุมัติคำขอสำเร็จ');
    fetchData();
  };
  const handleReject = (record: any) => {
    setSelected(record);
    setShowModal(true);
  };
  const handleRejectSubmit = async (values: any) => {
    await costRequestAPI.approveCostRequest(selected.id, { status: 'REJECTED', rejectionReason: values.rejectionReason });
    message.success('ปฏิเสธคำขอแล้ว');
    setShowModal(false);
    fetchData();
  };

  const columns = [
    { title: 'วันที่', dataIndex: 'date', key: 'date', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    { title: 'ชื่อรายการ', dataIndex: 'title', key: 'title' },
    { title: 'หมวดหมู่', dataIndex: 'category', key: 'category' },
    { title: 'จำนวนเงิน (บาท)', dataIndex: 'amount', key: 'amount', align: 'right', render: (a: number) => a?.toLocaleString() },
    { title: 'ผู้ขอ', dataIndex: 'requesterName', key: 'requesterName' },
    { title: 'สถานะ', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s==='PENDING'?'orange':s==='APPROVED'?'green':'red'}>{s==='PENDING'?'รออนุมัติ':s==='APPROVED'?'อนุมัติแล้ว':'ไม่อนุมัติ'}</Tag> },
    { title: 'หมายเหตุ', dataIndex: 'rejectionReason', key: 'rejectionReason' },
    { title: 'Action', key: 'action', render: (_: any, record: any) => (
      record.status === 'PENDING' ? <span>
        <Button type="link" onClick={()=>handleApprove(record)}>อนุมัติ</Button>
        <Button type="link" danger onClick={()=>handleReject(record)}>ไม่อนุมัติ</Button>
      </span> : null
    ) },
  ];

  return (
    <Card title="อนุมัติคำขอค่าใช้จ่าย (VP เท่านั้น)">
      <Table columns={columns} dataSource={data} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
      <Modal open={showModal} onCancel={()=>setShowModal(false)} title="เหตุผลที่ไม่อนุมัติ" footer={null}>
        <Form form={form} layout="vertical" onFinish={handleRejectSubmit}>
          <Form.Item name="rejectionReason" label="เหตุผล" rules={[{ required: true, message: 'กรุณากรอกเหตุผล' }]}> 
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>ยืนยัน</Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CostApproval;
