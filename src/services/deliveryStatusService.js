export const DELIVERY_STATUSES = {
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  UNDELIVERED: 'Undelivered',
};

function toDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toSlotDate(deliveryDate, deliveryTime) {
  if (!deliveryDate || !deliveryTime) return null;
  return new Date(`${deliveryDate}T${deliveryTime}:00`);
}

export function getDemoDeliveryStatus(delivery, now = new Date()) {
  const deliveryDate = delivery?.delivery_date;
  const deliveryTime = delivery?.delivery_time;
  const currentStatus = delivery?.current_status || DELIVERY_STATUSES.CONFIRMED;

  if (currentStatus !== DELIVERY_STATUSES.CONFIRMED) {
    return currentStatus;
  }

  if (!deliveryDate || !deliveryTime) {
    return currentStatus;
  }

  const today = toDateOnly(now);

  if (deliveryDate < today) {
    return DELIVERY_STATUSES.DELIVERED;
  }

  if (deliveryDate > today) {
    return DELIVERY_STATUSES.CONFIRMED;
  }

  const slotDate = toSlotDate(deliveryDate, deliveryTime);

  if (!slotDate) {
    return currentStatus;
  }

  return now >= slotDate
    ? DELIVERY_STATUSES.DELIVERED
    : DELIVERY_STATUSES.PREPARING;
}

export function withDemoDeliveryStatus(delivery, now = new Date()) {
  return {
    ...delivery,
    current_status: getDemoDeliveryStatus(delivery, now),
  };
}

export function withDemoDeliveryStatuses(deliveries = [], now = new Date()) {
  return deliveries.map((delivery) => withDemoDeliveryStatus(delivery, now));
}
