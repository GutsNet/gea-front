<template>
  <div class="notifications-host">
    <transition-group name="toast" tag="div" class="notifications-stack">
      <div
        v-for="toast in state.toasts"
        :key="toast.id"
        class="notification-toast"
        :class="`notification-toast--${toast.type}`"
      >
        <div class="notification-icon">
          <v-icon :icon="ICONS[toast.type]?.icon || ICONS.info.icon" size="20" />
        </div>

        <div class="notification-body">
          <p class="notification-label">{{ ICONS[toast.type]?.label || ICONS.info.label }}</p>
          <p class="notification-message">{{ toast.message }}</p>
        </div>

        <button
          type="button"
          class="notification-close"
          aria-label="Cerrar notificación"
          @click="notify.dismiss(toast.id)"
        >
          <v-icon icon="mdi-close" size="16" />
        </button>

        <img :src="leafIcon" alt="" aria-hidden="true" class="notification-watermark" />
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useNotifications, notify } from '../../services/notifications'
import leafIcon from '../../assets/images/leaf-icon.svg'

const state = useNotifications()

// Mismo lenguaje visual que el semáforo de infestación (Hawksworth) del
// resto de la app: verde = sano/OK, azul = en revisión, naranja = alerta
// leve, rojo oscuro = crítico. Los iconos refuerzan la temática forestal.
const ICONS = {
  success: { icon: 'mdi-leaf', label: 'Todo en orden' },
  info: { icon: 'mdi-magnify-scan', label: 'En revisión' },
  warning: { icon: 'mdi-bug-outline', label: 'Atención' },
  error: { icon: 'mdi-tree-outline', label: 'Crítico' },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Gabarito:wght@500;600;700&display=swap');

.notifications-host {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 3000;
  max-width: 380px;
  width: calc(100% - 48px);
  pointer-events: none;
  font-family: 'Gabarito', sans-serif;
}

.notifications-stack {
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
}

.notification-toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  pointer-events: auto;
  overflow: hidden;
  background: #ffffff;
  border-radius: 12px;
  border-left: 5px solid transparent;
  padding: 14px 36px 14px 14px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14);
}

.notification-icon {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-body {
  min-width: 0;
}

.notification-label {
  margin: 0 0 2px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.notification-message {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  line-height: 1.4;
}

.notification-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #9e9e9e;
  cursor: pointer;
  display: flex;
  padding: 2px;
  border-radius: 50%;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #4a4a4a;
}

.notification-watermark {
  position: absolute;
  bottom: -10px;
  right: -6px;
  width: 46px;
  height: 46px;
  opacity: 0.06;
  pointer-events: none;
}

/* Sano / éxito -> verde institucional */
.notification-toast--success {
  border-left-color: #2e7d32;
}
.notification-toast--success .notification-icon {
  background: #e4f3e6;
  color: #1b5e20;
}
.notification-toast--success .notification-label {
  color: #1b5e20;
}

/* En revisión / info -> azul */
.notification-toast--info {
  border-left-color: #1565c0;
}
.notification-toast--info .notification-icon {
  background: #e3edfb;
  color: #1565c0;
}
.notification-toast--info .notification-label {
  color: #1565c0;
}

/* Infestación ligera / warning -> naranja */
.notification-toast--warning {
  border-left-color: #ef6c00;
}
.notification-toast--warning .notification-icon {
  background: #fdead2;
  color: #ef6c00;
}
.notification-toast--warning .notification-label {
  color: #ef6c00;
}

/* Crítico / árbol muerto / error -> rojo oscuro */
.notification-toast--error {
  border-left-color: #7a1f1f;
}
.notification-toast--error .notification-icon {
  background: #f6e1e1;
  color: #7a1f1f;
}
.notification-toast--error .notification-label {
  color: #7a1f1f;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

.toast-leave-active {
  position: absolute;
  width: 100%;
}

@media (max-width: 600px) {
  .notifications-host {
    left: 16px;
    right: 16px;
    bottom: 16px;
    max-width: none;
    width: auto;
  }
}
</style>