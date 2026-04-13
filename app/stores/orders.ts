import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order } from '~/types/order'

export const useOrderStore = defineStore('orders', () => {
  const myOrders = ref<Order[]>([])
  const allOrders = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function setMyOrders(orders: Order[]): void {
    myOrders.value = orders
  }

  function setAllOrders(orders: Order[]): void {
    allOrders.value = orders
  }

  function setLoading(value: boolean): void {
    loading.value = value
  }

  function setError(message: string | null): void {
    error.value = message
  }

  function updateOrderInList(updatedOrder: Order): void {
    const myIdx = myOrders.value.findIndex(o => o.id === updatedOrder.id)
    if (myIdx >= 0) myOrders.value[myIdx] = updatedOrder

    const allIdx = allOrders.value.findIndex(o => o.id === updatedOrder.id)
    if (allIdx >= 0) allOrders.value[allIdx] = updatedOrder
  }

  return {
    myOrders,
    allOrders,
    loading,
    error,
    setMyOrders,
    setAllOrders,
    setLoading,
    setError,
    updateOrderInList,
  }
})
