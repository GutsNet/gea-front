<!--
G.E.A. Frontend
Layout móvil de la vista Cuenta.
-->

<template>
  <section class="cuenta-view">
    <div v-if="loading" class="cuenta-loading">Cargando información de la cuenta...</div>

    <template v-else>
      <!-- ---------- Perfil ---------- -->
      <div class="cuenta-card">
        <div class="cuenta-profile-main">
          <span class="cuenta-avatar">
            <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" v-html="icons.userCircle"></svg>
          </span>

          <div class="cuenta-profile-info">
            <h3 class="cuenta-name">{{ fullName }}</h3>
            <p class="cuenta-role-text">{{ roleLabel }}</p>
            <p class="cuenta-meta-line-plain">Matrícula: {{ user.matricula }}</p>
            <p v-if="user.email" class="cuenta-meta-line-plain">{{ user.email }}</p>
          </div>
        </div>
      </div>

      <!-- ---------- Mi actividad ---------- -->
      <div class="cuenta-mobile-section">
        <h3 class="cuenta-section-title">
          <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" v-html="icons.barChart"></svg>
          Mi actividad
        </h3>

        <div class="cuenta-card cuenta-mobile-list">
          <div class="cuenta-mobile-row">
            <span class="cuenta-mobile-row-icon">
              <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons.tree"></svg>
            </span>
            <div>
              <p class="cuenta-mobile-row-label">Árboles registrados</p>
              <p class="cuenta-mobile-row-value">{{ arbolesRegistrados }}</p>
            </div>
          </div>

          <div class="cuenta-mobile-row">
            <span class="cuenta-mobile-row-icon">
              <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons.fileText"></svg>
            </span>
            <div>
              <p class="cuenta-mobile-row-label">Reportes enviados</p>
              <p class="cuenta-mobile-row-value">{{ reportes.length }}</p>
            </div>
          </div>

          <div class="cuenta-mobile-row">
            <span class="cuenta-mobile-row-icon">
              <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons.droplet"></svg>
            </span>
            <div>
              <p class="cuenta-mobile-row-label">Kg recolectados</p>
              <p class="cuenta-mobile-row-value">{{ kgRecolectados }} kg</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ---------- Información ---------- -->
      <div class="cuenta-mobile-section">
        <h3 class="cuenta-section-title">
          <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" v-html="icons.info"></svg>
          Información
        </h3>

        <div class="cuenta-card cuenta-mobile-list">
          <div class="cuenta-mobile-row">
            <span class="cuenta-mobile-row-icon">
              <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons.shield"></svg>
            </span>
            <div>
              <p class="cuenta-mobile-row-label">Rol</p>
              <p class="cuenta-mobile-row-value cuenta-mobile-row-value--info">{{ roleLabel }}</p>
            </div>
          </div>

          <div class="cuenta-mobile-row">
            <span class="cuenta-mobile-row-icon">
              <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" v-html="icons.calendar"></svg>
            </span>
            <div>
              <p class="cuenta-mobile-row-label">Miembro desde</p>
              <p class="cuenta-mobile-row-value cuenta-mobile-row-value--info">{{ miembroDesde }}</p>
            </div>
          </div>
        </div>
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
  arbolesRegistrados,
  kgRecolectados,
  reportes,
  handleLogout,
  icons,
} = useCuenta();
</script>

<style src="@src/assets/styles/cuenta_view.css" scoped></style>