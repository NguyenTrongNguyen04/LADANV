import { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, Banknote, CreditCard, Download, Mail, Users, Wallet, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

interface Transaction {
  id: string;
  userName: string;
  email: string;
  amount: number;
  plan: 'Pro' | 'Premier';
  timestamp: string;
  status: 'completed' | 'pending';
}

const mockTransactions: Transaction[] = [
  { id: 'INV-24111901', userName: 'Bùi Nhật Minh', email: 'minhbnse180493@fpt.edu.vn', amount: 49_000, plan: 'Pro', timestamp: '2024-11-19T09:15:00', status: 'completed' },
  { id: 'INV-24112002', userName: 'Nguyễn Nhật Minh Anh', email: 'minhnnmse180221@fpt.edu.vn', amount: 199_000, plan: 'Premier', timestamp: '2024-11-20T11:42:00', status: 'completed' },
  { id: 'INV-24112103', userName: 'Phạm Hải Băng', email: 'bangph178921@fpt.edu.vn', amount: 49_000, plan: 'Pro', timestamp: '2024-11-21T08:27:00', status: 'completed' },
  { id: 'INV-24112204', userName: 'Nguyễn Hải Đăng', email: 'dangnh189821@fpt.edu.vn', amount: 199_000, plan: 'Premier', timestamp: '2024-11-22T20:10:00', status: 'completed' },
  { id: 'INV-24112305', userName: 'Mai Hoàng Vinh', email: 'vinhhoang0402@gmail.com', amount: 49_000, plan: 'Pro', timestamp: '2024-11-23T14:05:00', status: 'pending' },
  { id: 'INV-24112406', userName: 'Nguyễn Xuân Phước', email: 'xuanphuocxp@gmail.com', amount: 199_000, plan: 'Premier', timestamp: '2024-11-24T10:18:00', status: 'completed' }
];

const bankAccount = {
  bank: 'Techcombank',
  accountNumber: '848888888866',
  owner: 'NGUYEN TRONG NGUYEN'
};

const weeklyBuckets = ['19/11', '20/11', '21/11', '22/11', '23/11', '24/11', '25/11'] as const;

export function RevenueDashboard() {
  const totals = useMemo(() => {
    const totalRevenue = mockTransactions.reduce((sum, tx) => sum + (tx.status === 'completed' ? tx.amount : 0), 0);
    const pendingRevenue = mockTransactions.reduce((sum, tx) => sum + (tx.status === 'pending' ? tx.amount : 0), 0);
    const premierRevenue = mockTransactions.filter((tx) => tx.plan === 'Premier' && tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0);
    const proRevenue = mockTransactions.filter((tx) => tx.plan === 'Pro' && tx.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0);

    const daily = weeklyBuckets.map((day) => {
      const amount = mockTransactions
        .filter((tx) => new Date(tx.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) === day && tx.status === 'completed')
        .reduce((sum, tx) => sum + tx.amount, 0);
      return { day, amount };
    });

    return {
      totalRevenue,
      pendingRevenue,
      averageTicket: totalRevenue / mockTransactions.filter((tx) => tx.status === 'completed').length,
      completionRate: (mockTransactions.filter((tx) => tx.status === 'completed').length / mockTransactions.length) * 100,
      premierShare: (premierRevenue / (premierRevenue + proRevenue)) * 100,
      daily
    };
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);

  const handleCopyAccount = async () => {
    const text = `${bankAccount.bank} - ${bankAccount.accountNumber} - ${bankAccount.owner}`;
    try {
      await navigator.clipboard.writeText(text);
      alert('Đã sao chép thông tin tài khoản');
    } catch {
      alert('Không thể sao chép. Vui lòng thử lại.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-blue-600 flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Báo cáo doanh thu theo tuần 19/11 - 25/11
        </p>
        <h2 className="text-3xl font-bold text-slate-900">Doanh thu LADANV</h2>
        <p className="text-slate-500">Theo dõi dòng tiền, trạng thái giao dịch.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardDescription>Doanh thu hoàn tất</CardDescription>
              <CardTitle className="text-3xl mt-1">{formatCurrency(totals.totalRevenue)}</CardTitle>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center text-sm text-green-600 font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              +18% so với tuần trước
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardDescription>Giá trị trung bình</CardDescription>
              <CardTitle className="text-3xl mt-1">{formatCurrency(totals.averageTicket)}</CardTitle>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-slate-500">Tính trên 6 giao dịch thành công</CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardDescription>Tỷ lệ hoàn tất</CardDescription>
              <CardTitle className="text-3xl mt-1">{totals.completionRate.toFixed(0)}%</CardTitle>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Progress value={totals.completionRate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardDescription>Giao dịch chờ</CardDescription>
              <CardTitle className="text-3xl mt-1">{formatCurrency(totals.pendingRevenue)}</CardTitle>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex items-center gap-2 text-sm text-amber-600">
            <ArrowDownRight className="w-4 h-4" />
            1 giao dịch đang đợi đối soát
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Giao dịch Techcombank</CardTitle>
              <CardDescription>Thông tin chuyển khoản nhận qua tài khoản doanh nghiệp.</CardDescription>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4" />
              Xuất CSV
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <div className="space-y-2">
              {mockTransactions.map((tx) => (
                <div key={tx.id} className="px-6 py-4 flex flex-wrap items-center gap-4 border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-semibold text-slate-900">{tx.userName}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {tx.email}
                    </p>
                  </div>

                  <div className="w-32 text-right font-semibold">{formatCurrency(tx.amount)}</div>

                  <div className="text-sm text-slate-500 min-w-[120px]">
                    {new Date(tx.timestamp).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <Badge variant={tx.status === 'completed' ? 'success' : 'warning'}>
                    {tx.status === 'completed' ? 'Đã xác nhận' : 'Chờ đối soát'}
                  </Badge>

                  <Badge className={tx.plan === 'Premier' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}>{tx.plan}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
            <CardHeader className="space-y-4">
              <div>
                <CardDescription className="text-blue-100 uppercase tracking-[0.2em]">Tài khoản nhận</CardDescription>
                <CardTitle className="text-2xl text-white">Techcombank</CardTitle>
              </div>
              <div className="space-y-2 text-lg font-semibold">
                <p className="text-blue-100 text-sm">Số tài khoản</p>
                <p className="text-3xl tracking-widest">{bankAccount.accountNumber}</p>
                <p className="text-sm text-blue-100">Chủ tài khoản</p>
                <p className="text-xl">{bankAccount.owner}</p>
              </div>
              <Button onClick={handleCopyAccount} className="bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <Copy className="w-4 h-4" />
                Sao chép thông tin
              </Button>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phân bổ gói đăng ký</CardTitle>
              <CardDescription>52% doanh thu đến từ Premier.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Premier</span>
                  <span>{totals.premierShare.toFixed(0)}%</span>
                </div>
                <Progress value={totals.premierShare} />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Pro</span>
                  <span>{(100 - totals.premierShare).toFixed(0)}%</span>
                </div>
                <Progress value={100 - totals.premierShare} className="bg-slate-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo ngày</CardTitle>
              <CardDescription>Giai đoạn 19/11 - 25/11</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {totals.daily.map((day) => (
                <div key={day.day} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{day.day}</span>
                  </div>
                  <span className="font-semibold">{day.amount > 0 ? formatCurrency(day.amount) : '—'}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

