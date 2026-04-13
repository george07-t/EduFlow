"use client";
import { create } from "zustand";
import { ModalPayload } from "@/types/api";

interface ModalStore {
  isOpen: boolean;
  payload: ModalPayload;
  openModal: (payload: ModalPayload) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  payload: null,
  openModal: (payload) => set({ isOpen: true, payload }),
  closeModal: () => set({ isOpen: false, payload: null }),
}));
