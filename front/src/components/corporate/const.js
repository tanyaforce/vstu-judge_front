export const corporatePoolTableHeads = [
    { id: 'CreateDate', numeric: false, disablePadding: false, label: 'Дата создания' },
    { id: 'Promocode', numeric: false, disablePadding: false, label: 'Кодовое слово' },
    { id: 'PhoneNumber', numeric: false, disablePadding: false, label: 'Номер телефона владельца' },
    { id: 'OwnerPercent', numeric: false, disablePadding: false, label: 'Дополнительный процент владельца'},
    { id: 'GuestPercent', numeric: false, disablePadding: false, label: 'Дополнительный процент гостя' },
    { id: 'Active', numeric: false, disablePadding: false, label: 'Активность' },
];

export const corporateTransactionsTableHeads = [
    { id: 'DueDate', numeric: false, disablePadding: false, label: 'Дата использования' },
    { id: 'Reason', numeric: false, disablePadding: false, label: 'Тип начисления' },
    { id: 'Points', numeric: false, disablePadding: false, label: 'Количество баллов'},
    { id: 'Promocode', numeric: false, disablePadding: false, label: 'Промокод компании' },
];