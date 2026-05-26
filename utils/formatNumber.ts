/* eslint-disable @typescript-eslint/no-explicit-any */
export const formatNumber = (value: any) => {
    const raw = String(value || "");
    return raw.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const parseNumber = (value: string) => Number(value.replace(/[^0-9]/g, "") || "");
