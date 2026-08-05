<!--
G.E.A. Frontend
Layout de escritorio de la vista Cuenta.
-->

<template>
  <section class="cuenta-view">
    <div v-if="loading" class="cuenta-loading">Cargando información de la cuenta...</div>

    <template v-else>
      <!-- ---------- Perfil ---------- -->
      <div class="cuenta-card cuenta-profile">
        <div class="cuenta-profile-main">
          <span class="cuenta-avatar">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.userCircle"></svg>
          </span>

          <div class="cuenta-profile-info">
            <h3 class="cuenta-name">{{ fullName }}</h3>
            <span class="cuenta-role-badge">{{ roleLabel }}</span>

            <p v-if="user.email" class="cuenta-meta-line">
              <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons.mail"></svg>
              {{ user.email }}
            </p>
            <p class="cuenta-meta-line">
              <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons.idCard"></svg>
              Matrícula: {{ user.matricula }}
            </p>
          </div>
        </div>

        <div class="cuenta-profile-side">
          <div class="cuenta-side-item">
            <span class="cuenta-side-icon">
              <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons.calendar"></svg>
            </span>
            <div>
              <p class="cuenta-side-label">Miembro desde</p>
              <p class="cuenta-side-value">{{ miembroDesde }}</p>
            </div>
          </div>

          <span class="cuenta-side-divider"></span>

          <div class="cuenta-side-item">
            <span class="cuenta-side-icon">
              <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons.clock"></svg>
            </span>
            <div>
              <p class="cuenta-side-label">Último acceso</p>
              <p class="cuenta-side-value">{{ ultimoAcceso }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ---------- Estadísticas ---------- -->
      <div class="cuenta-stats">
        <div class="cuenta-card cuenta-stat">
          <span class="cuenta-stat-icon cuenta-stat-icon-green">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.tree"></svg>
          </span>
          <div>
            <p class="cuenta-stat-label">Árboles registrados</p>
            <p class="cuenta-stat-value">{{ arbolesRegistrados }}</p>
            <p class="cuenta-stat-hint">Total de árboles capturados en la plataforma</p>
          </div>
        </div>

        <div class="cuenta-card cuenta-stat">
          <span class="cuenta-stat-icon cuenta-stat-icon-green">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.fileText"></svg>
          </span>
          <div>
            <p class="cuenta-stat-label">Reportes enviados</p>
            <p class="cuenta-stat-value">{{ reportes.length }}</p>
            <p class="cuenta-stat-hint">Reportes realizados en el sistema</p>
          </div>
        </div>

        <div class="cuenta-card cuenta-stat">
          <span class="cuenta-stat-icon cuenta-stat-icon-green">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.droplet"></svg>
          </span>
          <div>
            <p class="cuenta-stat-label">Kg recolectados</p>
            <p class="cuenta-stat-value">{{ kgRecolectados }} kg</p>
            <p class="cuenta-stat-hint">Kilogramos totales recolectados</p>
          </div>
        </div>
      </div>

      <!-- ---------- Actividad reciente ---------- -->
      <div class="cuenta-card cuenta-activity">
        <h3 class="cuenta-activity-title">
          <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" v-html="icons.clock"></svg>
          Actividad reciente
        </h3>

        <div v-if="actividad.length === 0" class="cuenta-activity-empty">
          Aún no hay actividad registrada para tu cuenta.
        </div>

        <ul v-else class="cuenta-activity-list">
          <li v-for="item in actividad" :key="item.id" class="cuenta-activity-item">
            <span class="cuenta-activity-icon" :class="`cuenta-activity-icon-${item.color}`">
              <svg viewBox="0 0 24 24" class="icon-sm" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons[item.icon]"></svg>
            </span>
            <div class="cuenta-activity-body">
              <p class="cuenta-activity-label">{{ item.label }}</p>
              <p class="cuenta-activity-detail">{{ item.detail }}</p>
            </div>
            <span class="cuenta-activity-time">{{ formatRelativeTime(item.date) }}</span>
          </li>
        </ul>
      </div>

      <!-- ---------- Logout ---------- -->
      <button type="button" class="cuenta-logout-btn" @click="handleLogout">
        <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" v-html="icons.logOut"></svg>
        Cerrar sesión
      </button>

      <p class="cuenta-footer">
        <span class="cuenta-footer-brand">G.E.A. - Gestión Ecológica Arbórea &nbsp;•&nbsp; </span>
        Versión 1.0.0
      </p>
    </template>
  </section>
</template>

<script setup>
import { useCuenta } from '@src/composables/useCuenta';

const {
  user,
  loading,
  fullName,
  roleLabel,
  miembroDesde,
  ultimoAcceso,
  arbolesRegistrados,
  kgRecolectados,
  reportes,
  actividad,
  handleLogout,
  icons,
  formatRelativeTime,
} = useCuenta();
</script>

<style src="@src/assets/styles/cuenta_view.css" scoped></style>