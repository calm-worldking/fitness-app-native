import * as SecureStore from "expo-secure-store"

const baseURL: string = process.env.EXPO_PUBLIC_PARTNER_API_BASE || "http://192.168.10.205:3001"
const TOKEN_KEY = "auth_token"

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as any),
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${baseURL}${path}`, { ...init, headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  const ct = res.headers.get("content-type") || ""
  if (ct.includes("application/json")) return (await res.json()) as T
  return undefined as unknown as T
}

export const api = {
  async login(email: string, password: string) {
    const data = await request<{ token: string; user: any }>("/api/mobile/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    await saveToken(data.token)
    return data.user
  },
  async register(name: string, email: string, password: string) {
    return request("/api/mobile/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    })
  },
  async getCurrentUser() {
    return request<{ user: any }>("/api/mobile/auth/me")
  },
  async updateProfile(data: { name?: string; email?: string; phone?: string }) {
    return request<{ user: any }>("/api/mobile/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  async gymsList(params?: { 
    q?: string; 
    take?: number; 
    skip?: number;
    activityTags?: string;
    search?: string;
  }) {
    const sp = new URLSearchParams()
    if (params?.q) sp.set('search', params.q)
    if (params?.search) sp.set('search', params.search)
    if (params?.take) sp.set('take', String(params.take))
    if (params?.skip) sp.set('skip', String(params.skip))
    if (params?.activityTags) sp.set('activityTags', params.activityTags)
    
    return request<{ gyms: any[]; pagination: any }>(`/api/mobile/gyms?${sp.toString()}`)
  },
  async createGym(input: { name: string; address?: string; description?: string; services?: string[] }) {
    return request(`/api/mobile/gyms`, { method: "POST", body: JSON.stringify(input) })
  },
  async myBookings() {
    return request<{ items: any[] }>(`/api/mobile/bookings`)
  },
  async createBooking(classId: string) {
    return request(`/api/mobile/bookings`, { method: "POST", body: JSON.stringify({ classId }) })
  },
  async cancelBooking(id: string) {
    return request(`/api/mobile/bookings?id=${encodeURIComponent(id)}`, { method: "DELETE" })
  },
  async fetchClass(id: string) {
    return request<ClassDto>(`/api/mobile/classes/${id}`)
  },
  
  // Новые методы для поиска и рекомендаций
  async searchGyms(params?: {
    search?: string;
    activityTags?: string;
    services?: string;
    sortBy?: string;
    sortOrder?: string;
    hasClasses?: boolean;
    take?: number;
    skip?: number;
  }) {
    const sp = new URLSearchParams()
    if (params?.search) sp.set('search', params.search)
    if (params?.activityTags) sp.set('activityTags', params.activityTags)
    if (params?.services) sp.set('services', params.services)
    if (params?.sortBy) sp.set('sortBy', params.sortBy)
    if (params?.sortOrder) sp.set('sortOrder', params.sortOrder)
    if (params?.hasClasses !== undefined) sp.set('hasClasses', String(params.hasClasses))
    if (params?.take) sp.set('take', String(params.take))
    if (params?.skip) sp.set('skip', String(params.skip))
    
    return request<{ gyms: any[]; pagination: any; filters: any }>(`/api/mobile/search?${sp.toString()}`)
  },
  
  async getPopularGyms() {
    return request<{ popularGyms: any[]; diverseGyms: any[] }>('/api/mobile/gyms/popular')
  },
  
  async getGymRecommendations(params?: {
    preferredTags?: string;
    preferredServices?: string;
    take?: number;
  }) {
    const sp = new URLSearchParams()
    if (params?.preferredTags) sp.set('preferredTags', params.preferredTags)
    if (params?.preferredServices) sp.set('preferredServices', params.preferredServices)
    if (params?.take) sp.set('take', String(params.take))
    
    return request<any>(`/api/mobile/gyms/recommendations?${sp.toString()}`)
  },
  
  async getActivityTags() {
    return request<{ tags: string[]; count: number }>('/api/mobile/activity-tags')
  },
  
  async getServices() {
    return request<{ services: string[]; count: number }>('/api/mobile/services')
  },

  // API для работы с абонементами
  async getMySubscriptions() {
    return request<{ subscriptions: any[]; activeSubscription: any; familyMembers: any[] }>('/api/mobile/subscriptions/me')
  },

  async getSubscriptionPlans() {
    return request<{ plans: any[]; familyPlans: any[] }>('/api/mobile/subscriptions/plans')
  },

  async purchaseSubscription(planId: string, period: 'monthly' | 'yearly', peopleCount?: number) {
    return request('/api/mobile/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ planId, period, peopleCount })
    })
  },

  async getPaymentHistory(params?: { take?: number; skip?: number }) {
    const sp = new URLSearchParams()
    if (params?.take) sp.set('take', String(params.take))
    if (params?.skip) sp.set('skip', String(params.skip))

    return request<{ payments: any[]; total: number }>('/api/mobile/subscriptions/payments?' + sp.toString())
  },

  // Управление конкретной подпиской
  async freezeSubscription(subscriptionId: string, freezeData: { days: number; startDate: string; reason?: string }) {
    return request(`/api/mobile/subscriptions/${subscriptionId}/freeze`, {
      method: 'POST',
      body: JSON.stringify(freezeData)
    })
  },

  async unfreezeSubscription(subscriptionId: string) {
    return request(`/api/mobile/subscriptions/${subscriptionId}/unfreeze`, {
      method: 'POST'
    })
  },

  async getFreezes(subscriptionId: string) {
    return request<{ freezes: any[]; statistics: any }>(`/api/mobile/subscriptions/${subscriptionId}/freezes`)
  },

  // API для приглашений
  async sendInvitation(subscriptionId: string, invitationData: { email: string; message?: string }) {
    return request(`/api/mobile/subscriptions/${subscriptionId}/invite`, {
      method: 'POST',
      body: JSON.stringify(invitationData)
    })
  },

  async getInvitations() {
    return request<{ invitations: any[] }>('/api/mobile/invitations')
  },

  async respondToInvitation(invitationId: string, action: 'accept' | 'reject') {
    return request(`/api/mobile/invitations/${invitationId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action })
    })
  },

  async extendSubscription(subscriptionId: string, months: number) {
    return request(`/api/mobile/subscriptions/${subscriptionId}/extend`, {
      method: 'POST',
      body: JSON.stringify({ months })
    })
  },

  // Управление членами семьи
  async addFamilyMember(subscriptionId: string, memberData: { name: string; email: string; phone?: string }) {
    return request(`/api/mobile/subscriptions/${subscriptionId}/add-member`, {
      method: 'POST',
      body: JSON.stringify(memberData)
    })
  },

  async removeFamilyMember(subscriptionId: string, memberId: string) {
    return request(`/api/mobile/subscriptions/${subscriptionId}/remove-member`, {
      method: 'DELETE',
      body: JSON.stringify({ memberId })
    })
  },

  async cancelSubscription(subscriptionId: string) {
    try {
      // Пробуем стандартный эндпоинт отмены
      return await request(`/api/mobile/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST'
      })
    } catch {
      console.log('Cancel endpoint not found, trying alternative...')
      try {
        // Fallback 1: используем DELETE метод на основном эндпоинте подписки
        return await request(`/api/mobile/subscriptions/${subscriptionId}`, {
          method: 'DELETE'
        })
      } catch {
        console.log('Delete method failed, trying status update...')
        // Fallback 2: пытаемся изменить статус на cancelled
        return await request(`/api/mobile/subscriptions/${subscriptionId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'cancelled' })
        })
      }
    }
  },

  // API для получения статистики пользователя
  async getUserStats() {
    try {
      return await request<{
        totalWorkouts: number;
        thisMonth: number;
        totalHours: number;
        weekStreak: number;
        favoriteWorkout: string;
        completedBookings: number;
        cancelledBookings: number;
      }>('/api/mobile/stats')
    } catch {
      console.log('Stats API not available, calculating from bookings...')
      // Fallback: вычисляем статистику из данных о бронированиях
      return this.calculateStatsFromBookings()
    }
  },

  // Вычисление статистики из данных о бронированиях
  async calculateStatsFromBookings() {
    try {
      const bookings = await this.myBookings()
      const allBookings = bookings.items || []
      
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      // Фильтруем завершенные бронирования
      const completedBookings = allBookings.filter((booking: any) => 
        booking.status === 'completed' || booking.status === 'confirmed'
      )
      
      // Бронирования этого месяца
      const thisMonthBookings = completedBookings.filter((booking: any) => {
        const bookingDate = new Date(booking.class.startsAt)
        return bookingDate >= startOfMonth
      })
      
      // Подсчитываем общее время тренировок
      let totalHours = 0
      completedBookings.forEach((booking: any) => {
        const startTime = new Date(booking.class.startsAt)
        const endTime = new Date(booking.class.endsAt)
        const durationMs = endTime.getTime() - startTime.getTime()
        const durationHours = durationMs / (1000 * 60 * 60)
        totalHours += durationHours
      })
      
      // Вычисляем недельный стрик
      const weekStreak = this.calculateWeekStreak(completedBookings)
      
      // Находим любимый тип тренировки
      const workoutTypes: { [key: string]: number } = {}
      completedBookings.forEach((booking: any) => {
        const type = booking.class.title || 'Неизвестно'
        workoutTypes[type] = (workoutTypes[type] || 0) + 1
      })
      const favoriteWorkout = Object.keys(workoutTypes).reduce((a, b) => 
        workoutTypes[a] > workoutTypes[b] ? a : b, '-'
      )
      
      return {
        totalWorkouts: completedBookings.length,
        thisMonth: thisMonthBookings.length,
        totalHours: Math.round(totalHours * 10) / 10, // Округляем до 1 знака
        weekStreak,
        favoriteWorkout,
        completedBookings: completedBookings.length,
        cancelledBookings: allBookings.filter((b: any) => b.status === 'cancelled').length
      }
    } catch (error) {
      console.log('Failed to calculate stats from bookings:', error)
      return {
        totalWorkouts: 0,
        thisMonth: 0,
        totalHours: 0,
        weekStreak: 0,
        favoriteWorkout: '-',
        completedBookings: 0,
        cancelledBookings: 0
      }
    }
  },

  // Вычисление недельного стрика
  calculateWeekStreak(completedBookings: any[]) {
    if (completedBookings.length === 0) return 0
    
    // Сортируем бронирования по дате
    const sortedBookings = completedBookings
      .map(booking => new Date(booking.class.startsAt))
      .sort((a, b) => b.getTime() - a.getTime())
    
    let streak = 0
    
    // Группируем по неделям
    const weeks: Date[][] = []
    sortedBookings.forEach(date => {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Начало недели (воскресенье)
      weekStart.setHours(0, 0, 0, 0)
      
      let weekFound = false
      for (let i = 0; i < weeks.length; i++) {
        const existingWeekStart = new Date(weeks[i][0])
        existingWeekStart.setDate(weeks[i][0].getDate() - weeks[i][0].getDay())
        existingWeekStart.setHours(0, 0, 0, 0)
        
        if (weekStart.getTime() === existingWeekStart.getTime()) {
          weeks[i].push(date)
          weekFound = true
          break
        }
      }
      
      if (!weekFound) {
        weeks.push([date])
      }
    })
    
    // Сортируем недели по дате (от новых к старым)
    weeks.sort((a, b) => b[0].getTime() - a[0].getTime())
    
    // Подсчитываем последовательные недели
    for (let i = 0; i < weeks.length; i++) {
      const weekStart = new Date(weeks[i][0])
      weekStart.setDate(weeks[i][0].getDate() - weeks[i][0].getDay())
      weekStart.setHours(0, 0, 0, 0)
      
      const expectedWeekStart = new Date()
      expectedWeekStart.setDate(expectedWeekStart.getDate() - expectedWeekStart.getDay() - (i * 7))
      expectedWeekStart.setHours(0, 0, 0, 0)
      
      // Проверяем, что это ожидаемая неделя
      if (Math.abs(weekStart.getTime() - expectedWeekStart.getTime()) < 7 * 24 * 60 * 60 * 1000) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  },
}



export type GymDto = {
  id: string
  name: string
  address?: string | null
  description?: string | null
  services: string[]
  photos: string[]
  activityTags?: string[]
  instagram?: string | null
  createdAt?: string
  latitude?: number | null
  longitude?: number | null
  gisData?: {
    latitude: number
    longitude: number
    accuracy?: number
    address?: string
    placeId?: string
  } | null
  _count?: {
    classes: number
    classTypes?: number
  }
  classes?: ClassDto[]
  classTypes?: any[]
}

export type ClassDto = {
  id: string
  gymId: string
  title: string
  description?: string | null
  coach?: string | null
  startsAt: string
  endsAt: string
  capacity?: number | null
  gym?: {
    id: string
    name: string
    address?: string | null
  }
}

// API для получения данных с партнёрского сайта
export async function fetchGyms(params?: { q?: string; take?: number; skip?: number; activityTags?: string; search?: string }): Promise<{ items: GymDto[]; total: number; meta: any }> {
  const sp = new URLSearchParams()
  if (params?.q) sp.set('search', params.q)
  if (params?.search) sp.set('search', params.search)
  if (params?.take) sp.set('take', String(params.take))
  if (params?.skip) sp.set('skip', String(params.skip))
  if (params?.activityTags) sp.set('activityTags', params.activityTags)
  
  console.log('📡 Fetching gyms from API with params:', sp.toString());
  const result = await request<{ gyms: GymDto[]; pagination: any }>(`/api/mobile/gyms?${sp.toString()}`)
  console.log('📡 Received gyms data:', JSON.stringify(result, null, 2));
  
  // Адаптируем структуру ответа
  if (result.gyms && Array.isArray(result.gyms)) {
    return {
      items: result.gyms,
      total: result.pagination?.total || result.gyms.length,
      meta: { timestamp: new Date().toISOString(), pagination: result.pagination }
    }
  }
  
  // Если API возвращает другую структуру
  if (result && typeof result === 'object' && 'items' in result) {
    return {
      items: (result as any).items || [],
      total: (result as any).total || 0,
      meta: { timestamp: new Date().toISOString() }
    }
  }
  
  throw new Error('Invalid gyms response format');
}

export async function fetchGym(id: string) {
  console.log('📡 Fetching gym data from API for ID:', id);
  const response = await request<any>(`/api/mobile/gyms/${id}`);
  console.log('📡 Received gym data:', JSON.stringify(response, null, 2));
  
  // API возвращает данные в структуре { gym: {...} }
  const gymData = response.gym || response;
  
  // Проверяем, что получили валидные данные
  if (!gymData || !gymData.id) {
    throw new Error('Invalid gym data received');
  }
  
  return gymData;
}

export async function fetchClasses(params?: { gymId?: string; from?: string; to?: string; take?: number; skip?: number }) {
  const sp = new URLSearchParams()
  if (params?.gymId) sp.set('gymId', params.gymId)
  if (params?.from) sp.set('from', params.from)
  if (params?.to) sp.set('to', params.to)
  if (params?.take) sp.set('take', String(params.take))
  if (params?.skip) sp.set('skip', String(params.skip))
  
  console.log('📡 Fetching classes from API with params:', sp.toString());
  const result = await request<{ items: ClassDto[]; total: number; meta: any }>(`/api/mobile/classes?${sp.toString()}`)
  console.log('📡 Received classes data:', JSON.stringify(result, null, 2));
  
  return result;
}

// Тип для забронированных занятий
export interface BookedClassDto {
  id: string;
  classId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  bookedAt: string;
  confirmedAt?: string;
  class: {
    id: string;
    title: string;
    description?: string;
    startsAt: string;
    endsAt: string;
    coach?: string;
    gym: {
      id: string;
      name: string;
      address?: string;
      rating?: number;
    };
  };
}

// API для получения забронированных занятий пользователя
export async function fetchUserBookings(params?: { 
  take?: number; 
  skip?: number 
}) {
  const sp = new URLSearchParams()
  if (params?.take) sp.set('take', String(params.take))
  if (params?.skip) sp.set('skip', String(params.skip))
  
  console.log('📡 Fetching user bookings from API with params:', sp.toString());
  const result = await request<BookedClassDto[]>(`/api/mobile/bookings?${sp.toString()}`)
  console.log('📡 Received bookings data:', JSON.stringify(result, null, 2));
  
  if (Array.isArray(result)) {
    return {
      items: result,
      total: result.length,
      meta: { timestamp: new Date().toISOString() }
    }
  }
  
  // Если API возвращает объект с items
  if (result && typeof result === 'object' && 'items' in result) {
    return result as { items: BookedClassDto[]; total: number; meta: any }
  }
  
  throw new Error('Invalid bookings response format');
}

// API для создания бронирования
export async function createBooking(classId: string) {
  try {
    const result = await request<BookedClassDto>(`/api/mobile/bookings`, {
      method: 'POST',
      body: JSON.stringify({ classId })
    })
    return result
  } catch (error) {
    console.log('📱 Failed to create booking:', error)
    throw error
  }
}

// API для отмены бронирования
export async function cancelBooking(bookingId: string) {
  try {
    await request(`/api/mobile/bookings?id=${bookingId}`, {
      method: 'DELETE'
    })
    return true
  } catch (error) {
    console.log('📱 Failed to cancel booking:', error)
    throw error
  }
}





