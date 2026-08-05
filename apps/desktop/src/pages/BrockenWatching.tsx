import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import { toast } from 'sonner';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
} from '@mui/material';

const severityOptions = ['Thấp', 'Trung bình', 'Cao', 'Cực cao'];

export default function BrokenWatching() {
  const [products, setProducts] = useState<any[]>([]);
  const [inventories, setInventories] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [productId, setProductId] = useState('');
  const [productDetailId, setProductDetailId] = useState('');
  const [damageStatus, setDamageStatus] = useState('');
  const [cause, setCause] = useState('');
  const [repairStartDate, setRepairStartDate] = useState('');
  const [severity, setSeverity] = useState('');
  const [repairUnit, setRepairUnit] = useState('');
  const [receivedDate, setReceivedDate] = useState('');
  const [note, setNote] = useState('');

  const selectedProduct = useMemo(
    () => products.find((item) => String(item.id) === productId),
    [products, productId],
  );

  const availableDetails = useMemo(
    () =>
      inventories.filter(
        (item) => String(item.productId) === productId && item.status !== 'REPAIR',
      ),
    [inventories, productId],
  );

  const today = new Date().toISOString().slice(0, 10);

  async function loadData() {
    try {
      const [productRes, inventoryRes, repairRes] = await Promise.all([
        api.get('/products'),
        api.get('/inventory'),
        api.get('/repairs'),
      ]);

      setProducts(productRes.data);
      setInventories(inventoryRes.data);
      setRepairs(repairRes.data);
    } catch {
      toast.error('Không tải được dữ liệu, vui lòng thử lại.');
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setEditId(null);
    setProductId('');
    setProductDetailId('');
    setDamageStatus('');
    setCause('');
    setRepairStartDate(today);
    setSeverity('');
    setRepairUnit('');
    setReceivedDate('');
    setNote('');
  }

  function openCreateModal() {
    resetForm();
    setOpen(true);
  }

  function openEditModal(record: any) {
    setEditId(record.id);
    setProductId(String(record.productDetail?.productId || ''));
    setProductDetailId(String(record.productDetailId || ''));
    setDamageStatus(record.damageStatus || '');
    setCause(record.cause || '');
    setRepairStartDate(record.repairStartDate ? record.repairStartDate.slice(0, 10) : today);
    setSeverity(record.severity || '');
    setRepairUnit(record.repairUnit || '');
    setReceivedDate(record.receivedDate ? record.receivedDate.slice(0, 10) : '');
    setNote(record.note || '');
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  async function submit() {
    if (!productId || !productDetailId) {
      toast.error('Vui lòng chọn tên và số hiệu');
      return;
    }

    try {
      const payload = {
        productDetailId: Number(productDetailId),
        damageStatus,
        cause,
        repairStartDate: repairStartDate || null,
        severity,
        repairUnit,
        receivedDate: receivedDate || null,
        note,
      };

      if (editId) {
        await api.patch(`/repairs/${editId}`, payload);
        toast.success('Cập nhật thông tin sữa chữa thành công');
      } else {
        await api.post('/repairs', payload);
        toast.success('Thêm hồ sơ sửa chữa thành công');
      }

      closeModal();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lưu dữ liệu thất bại');
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Bạn có chắc muốn xóa hồ sơ này?')) return;

    try {
       await api.delete(`/repairs/${id}`);
      toast.success('Xóa hồ sơ sửa chữa thành công');
      loadData();
    } catch {
      toast.error('Xóa thất bại');
    }
  }

  const rows = repairs.map((item: any, index: number) => ({
    id: item.id,
    stt: index + 1,
    createdAt: new Date(item.createdAt).toLocaleDateString('vi-VN'),
    productName: item.productDetail?.product?.name || '-',
    serialNumber: item.productDetail?.serialNumber || '-',
    unit: item.productDetail?.product?.unit || '-',
    damageStatus: item.damageStatus || '-',
    cause: item.cause || '-',
    repairStartDate: item.repairStartDate ? new Date(item.repairStartDate).toLocaleDateString('vi-VN') : '-',
    severity: item.severity || '-',
    repairUnit: item.repairUnit || '-',
    receivedDate: item.receivedDate ? new Date(item.receivedDate).toLocaleDateString('vi-VN') : '-',
    note: item.note || '-',
    status: item.productDetail?.status,
    raw: item,
  }));

  const columns: GridColDef[] = [
    { field: 'stt', headerName: 'STT', width: 70 },
    { field: 'createdAt', headerName: 'Ngày ghi nhận', width: 140 },
    { field: 'productName', headerName: 'Tên', flex: 1, minWidth: 160 },
    { field: 'serialNumber', headerName: 'Số hiệu', flex: 1, minWidth: 140 },
    { field: 'unit', headerName: 'Đơn vị tính', width: 120 },
    { field: 'damageStatus', headerName: 'Tình trạng', flex: 1, minWidth: 160 },
    { field: 'repairStartDate', headerName: 'Ngày đi sửa', width: 140 },
    { field: 'severity', headerName: 'Mức độ', width: 120 },
    { field: 'repairUnit', headerName: 'Đơn vị sửa chữa', flex: 1, minWidth: 180 },
    { field: 'receivedDate', headerName: 'Ngày nhận việc', width: 140 },
    { field: 'note', headerName: 'Nhận xét', flex: 1, minWidth: 200 },
    {
      field: 'status',
      headerName: 'Trạng thái kho',
      width: 140,
      renderCell: (params) => (
        <Chip
          size="small"
          label={
            params.value === 'REPAIR'
              ? 'Sửa chữa'
              : params.value === 'IN_STOCK'
              ? 'Trong kho'
              : 'Đã cập nhật'
          }
          color={
            params.value === 'REPAIR'
              ? 'warning'
              : params.value === 'IN_STOCK'
              ? 'success'
              : 'error'
          }
        />
      ),
    },
    {
      field: 'action',
      headerName: 'Thao tác',
      width: 240,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" onClick={() => openEditModal(params.row.raw)}>
            Sửa
          </Button>
          <Button size="small" color="error" variant="outlined" onClick={() => handleDelete(params.row.raw.id)}>
            Xóa
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Theo dõi hư hỏng và sửa chữa</h1>
          <p className="text-slate-500">Nhập và quản lý thông tin sửa chữa, tự động cập nhật trạng thái kho.</p>
        </div>
        <Button variant="contained" size="large" onClick={openCreateModal}>
          Thêm hồ sơ sửa chữa
        </Button>
      </div>

      <Paper className="p-4">
        <DataGrid
          autoHeight
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Paper>

      <Dialog open={open} onClose={closeModal} fullWidth maxWidth="lg">
        <DialogTitle>{editId ? 'Cập nhật hồ sơ sửa chữa' : 'Thêm hồ sơ sửa chữa'}</DialogTitle>
        <DialogContent>
          <Box className="grid gap-4 mt-3 md:grid-cols-2">
            <Autocomplete
              options={products}
              value={products.find((item) => String(item.id) === productId) || null}
              onChange={(_, newValue) => {
                setProductId(newValue ? String(newValue.id) : '');
                setProductDetailId('');
              }}
              getOptionLabel={(option) => option.name || ''}
              renderInput={(params) => <TextField {...params} label="Tên" size="small" />}
            />
            <TextField
              label="Đơn vị tính"
              size="small"
              value={selectedProduct?.unit || ''}
              disabled
            />
            <Autocomplete
              options={availableDetails}
              value={availableDetails.find((item) => String(item.id) === productDetailId) || null}
              onChange={(_, newValue) => setProductDetailId(newValue ? String(newValue.id) : '')}
              getOptionLabel={(option) => option.serialNumber || ''}
              renderInput={(params) => <TextField {...params} label="Số hiệu" size="small" />}
              disabled={!productId}
            />
            <TextField
              label="Tình trạng hư hỏng"
              size="small"
              value={damageStatus}
              onChange={(e) => setDamageStatus(e.target.value)}
              fullWidth
            />
            <TextField
              label="Nguyên nhân"
              size="small"
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              fullWidth
            />
           <TextField
  label="Ngày đi sửa chữa"
  size="small"
  type="date"
  value={repairStartDate}
  onChange={(e) => setRepairStartDate(e.target.value)}
  slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
/>
            <Autocomplete
              options={severityOptions}
              value={severity}
              onChange={(_, newValue) => setSeverity(newValue || '')}
              renderInput={(params) => <TextField {...params} label="Mức độ" size="small" />}
            />
            <TextField
              label="Đơn vị / người nhận sửa chữa"
              size="small"
              value={repairUnit}
              onChange={(e) => setRepairUnit(e.target.value)}
              fullWidth
            />
            <TextField
              label="Ngày nhận việc"
              size="small"
              variant="outlined"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
            />
            <TextField
              label="Nhận xét tổng thể"
              size="small"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              label="Ngày tạo"
              size="small"
              type="date"
              value={today}
              disabled
             slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Hủy</Button>
          <Button variant="contained" onClick={submit}>
            {editId ? 'Cập nhật' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
