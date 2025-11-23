import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  fullName: string;
  login: string;
  email: string;
  phone: string;
  isAdmin: boolean;
}

interface Application {
  id: number;
  userId: number;
  title: string;
  description: string;
  status: 'Новая' | 'Решена' | 'Отклонена';
  createdAt: string;
}

function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([
    { id: 1, login: 'admin', fullName: 'Администратор', email: 'admin@test.ru', phone: '+7 (900)000-00-00', isAdmin: true }
  ]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    fullName: '', login: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [newApplication, setNewApplication] = useState({ title: '', description: '' });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    
    const savedApps = localStorage.getItem('applications');
    if (savedApps) setApplications(JSON.parse(savedApps));
  }, []);

  const validateRegister = () => {
    const newErrors: Record<string, string> = {};
    
    if (!/^[а-яА-ЯёЁ\s-]+$/.test(registerForm.fullName)) {
      newErrors.fullName = 'ФИО должно содержать только кириллицу, пробелы и дефисы';
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(registerForm.login)) {
      newErrors.login = 'Логин должен содержать только латиницу и цифры';
    }
    
    if (users.some(u => u.login === registerForm.login)) {
      newErrors.login = 'Этот логин уже занят';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      newErrors.email = 'Неверный формат email';
    }
    
    if (!/^\+7 \(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(registerForm.phone)) {
      newErrors.phone = 'Формат: +7 (XXX)XXX-XX-XX';
    }
    
    if (registerForm.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    const user = users.find(u => u.login === loginForm.login);
    if (!user || (loginForm.password !== 'password' && loginForm.password !== '123456')) {
      toast({ title: 'Ошибка', description: 'Неверный логин или пароль', variant: 'destructive' });
      return;
    }
    
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    toast({ title: 'Успешно!', description: `Добро пожаловать, ${user.fullName}!` });
  };

  const handleRegister = () => {
    if (!validateRegister()) {
      toast({ title: 'Ошибка', description: 'Проверьте правильность заполнения полей', variant: 'destructive' });
      return;
    }
    
    const newUser: User = {
      id: users.length + 1,
      fullName: registerForm.fullName,
      login: registerForm.login,
      email: registerForm.email,
      phone: registerForm.phone,
      isAdmin: false
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    toast({ title: 'Регистрация завершена!', description: 'Добро пожаловать!' });
    setRegisterForm({ fullName: '', login: '', email: '', phone: '', password: '', confirmPassword: '' });
  };

  const handleCreateApplication = () => {
    if (!newApplication.title || !newApplication.description) {
      toast({ title: 'Ошибка', description: 'Заполните все поля', variant: 'destructive' });
      return;
    }
    
    const app: Application = {
      id: applications.length + 1,
      userId: currentUser!.id,
      title: newApplication.title,
      description: newApplication.description,
      status: 'Новая',
      createdAt: new Date().toLocaleString('ru-RU')
    };
    
    const updatedApps = [...applications, app];
    setApplications(updatedApps);
    localStorage.setItem('applications', JSON.stringify(updatedApps));
    
    toast({ title: 'Заявка создана!', description: 'Ожидайте рассмотрения' });
    setNewApplication({ title: '', description: '' });
  };

  const handleStatusChange = (appId: number, newStatus: 'Решена' | 'Отклонена') => {
    const updatedApps = applications.map(app => 
      app.id === appId ? { ...app, status: newStatus } : app
    );
    setApplications(updatedApps);
    localStorage.setItem('applications', JSON.stringify(updatedApps));
    toast({ title: 'Статус обновлен', description: `Заявка помечена как "${newStatus}"` });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast({ title: 'Вы вышли', description: 'До встречи!' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Новая': return 'bg-gradient-to-r from-primary to-secondary text-white';
      case 'Решена': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'Отклонена': return 'bg-gradient-to-r from-red-500 to-rose-500 text-white';
      default: return 'bg-muted';
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl mb-6 shadow-2xl animate-float">
                <Icon name="Sprout" size={40} className="text-white" />
              </div>
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                ГородОк
              </h1>
              <p className="text-2xl text-muted-foreground">
                Современный портал благоустройства территорий
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 animate-slide-up">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-4">
                    <Icon name="Users" size={24} className="text-white" />
                  </div>
                  <CardTitle className="text-2xl">Для жителей</CardTitle>
                  <CardDescription className="text-base">Создавайте заявки на благоустройство вашего района</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Icon name="Check" size={20} className="text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm">Быстрая подача заявок онлайн</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="Check" size={20} className="text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm">Отслеживание статуса в реальном времени</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="Check" size={20} className="text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm">История всех ваших обращений</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-orange-600 rounded-2xl flex items-center justify-center mb-4">
                    <Icon name="Shield" size={24} className="text-white" />
                  </div>
                  <CardTitle className="text-2xl">Для администрации</CardTitle>
                  <CardDescription className="text-base">Управляйте заявками жителей эффективно</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Icon name="Check" size={20} className="text-accent mt-1 flex-shrink-0" />
                    <span className="text-sm">Централизованная система управления</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="Check" size={20} className="text-accent mt-1 flex-shrink-0" />
                    <span className="text-sm">Обработка и решение заявок</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="Check" size={20} className="text-accent mt-1 flex-shrink-0" />
                    <span className="text-sm">Прозрачная система статусов</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl max-w-md mx-auto animate-scale-in">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Вход в систему</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
                      Вход
                    </TabsTrigger>
                    <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
                      Регистрация
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login">Логин</Label>
                      <Input 
                        id="login"
                        value={loginForm.login}
                        onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
                        placeholder="Введите логин"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Пароль</Label>
                      <Input 
                        id="password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder="Введите пароль"
                        className="h-12"
                      />
                    </div>
                    <Button onClick={handleLogin} className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white text-lg font-semibold">
                      Войти
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                      Тестовые данные: admin / password
                    </p>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">ФИО</Label>
                      <Input 
                        id="fullName"
                        value={registerForm.fullName}
                        onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                        placeholder="Иванов Иван Иванович"
                        className={`h-12 ${errors.fullName ? 'border-red-500' : ''}`}
                      />
                      {errors.fullName && <p className="text-xs text-red-500 animate-fade-in">{errors.fullName}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="regLogin">Логин</Label>
                      <Input 
                        id="regLogin"
                        value={registerForm.login}
                        onChange={(e) => setRegisterForm({ ...registerForm, login: e.target.value })}
                        placeholder="username"
                        className={`h-12 ${errors.login ? 'border-red-500' : ''}`}
                      />
                      {errors.login && <p className="text-xs text-red-500 animate-fade-in">{errors.login}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        placeholder="example@mail.ru"
                        className={`h-12 ${errors.email ? 'border-red-500' : ''}`}
                      />
                      {errors.email && <p className="text-xs text-red-500 animate-fade-in">{errors.email}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input 
                        id="phone"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        placeholder="+7 (900)999-99-99"
                        className={`h-12 ${errors.phone ? 'border-red-500' : ''}`}
                      />
                      {errors.phone && <p className="text-xs text-red-500 animate-fade-in">{errors.phone}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="regPassword">Пароль</Label>
                      <Input 
                        id="regPassword"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        placeholder="Минимум 6 символов"
                        className={`h-12 ${errors.password ? 'border-red-500' : ''}`}
                      />
                      {errors.password && <p className="text-xs text-red-500 animate-fade-in">{errors.password}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Повтор пароля</Label>
                      <Input 
                        id="confirmPassword"
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        placeholder="Повторите пароль"
                        className={`h-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      />
                      {errors.confirmPassword && <p className="text-xs text-red-500 animate-fade-in">{errors.confirmPassword}</p>}
                    </div>
                    
                    <Button onClick={handleRegister} className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white text-lg font-semibold">
                      Зарегистрироваться
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const userApplications = applications.filter(app => app.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <header className="bg-white/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center">
                <Icon name="Sprout" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ГородОк
                </h1>
                <p className="text-sm text-muted-foreground">Портал благоустройства</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">{currentUser.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {currentUser.isAdmin ? 'Администратор' : 'Пользователь'}
                </p>
              </div>
              <Button onClick={handleLogout} variant="outline" className="gap-2">
                <Icon name="LogOut" size={18} />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentUser.isAdmin ? (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-orange-600 rounded-3xl flex items-center justify-center">
                    <Icon name="Shield" size={32} className="text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Панель администратора</CardTitle>
                    <CardDescription className="text-base">Управление заявками жителей</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="Inbox" size={64} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-xl text-muted-foreground">Заявок пока нет</p>
                    </div>
                  ) : (
                    applications.map((app, index) => {
                      const user = users.find(u => u.id === app.userId);
                      return (
                        <Card key={app.id} className="border-2 hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                  <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                                  <span className="text-sm text-muted-foreground">{app.createdAt}</span>
                                </div>
                                <h3 className="text-xl font-bold">{app.title}</h3>
                                <p className="text-muted-foreground">{app.description}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Icon name="User" size={16} />
                                  <span>{user?.fullName} ({user?.email})</span>
                                </div>
                              </div>
                              
                              {app.status === 'Новая' && (
                                <div className="flex flex-col gap-2">
                                  <Button 
                                    onClick={() => handleStatusChange(app.id, 'Решена')}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white gap-2"
                                  >
                                    <Icon name="CheckCircle" size={18} />
                                    Решена
                                  </Button>
                                  <Button 
                                    onClick={() => handleStatusChange(app.id, 'Отклонена')}
                                    variant="destructive"
                                    className="gap-2"
                                  >
                                    <Icon name="XCircle" size={18} />
                                    Отклонена
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center">
                    <Icon name="Plus" size={32} className="text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Создать заявку</CardTitle>
                    <CardDescription className="text-base">Опишите проблему благоустройства в вашем районе</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название заявки</Label>
                  <Input 
                    id="title"
                    value={newApplication.title}
                    onChange={(e) => setNewApplication({ ...newApplication, title: e.target.value })}
                    placeholder="Например: Требуется ремонт детской площадки"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание проблемы</Label>
                  <Textarea 
                    id="description"
                    value={newApplication.description}
                    onChange={(e) => setNewApplication({ ...newApplication, description: e.target.value })}
                    placeholder="Подробно опишите проблему..."
                    className="min-h-32"
                  />
                </div>
                <Button onClick={handleCreateApplication} className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white text-lg font-semibold gap-2">
                  <Icon name="Send" size={20} />
                  Отправить заявку
                </Button>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center">
                    <Icon name="FileText" size={32} className="text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Мои заявки</CardTitle>
                    <CardDescription className="text-base">История всех ваших обращений</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userApplications.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="Inbox" size={64} className="mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-xl text-muted-foreground">У вас пока нет заявок</p>
                      <p className="text-sm text-muted-foreground mt-2">Создайте первую заявку выше</p>
                    </div>
                  ) : (
                    userApplications.map((app, index) => (
                      <Card key={app.id} className="border-2 hover:shadow-lg transition-all animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                        <CardContent className="p-6 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                            <span className="text-sm text-muted-foreground">{app.createdAt}</span>
                          </div>
                          <h3 className="text-xl font-bold">{app.title}</h3>
                          <p className="text-muted-foreground">{app.description}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default Index;