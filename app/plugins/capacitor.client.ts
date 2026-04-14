import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Keyboard } from '@capacitor/keyboard'
import { App } from '@capacitor/app'

export default defineNuxtPlugin(async () => {
  if (!Capacitor.isNativePlatform()) return

  try {
    await StatusBar.setStyle({ style: Style.Light })
    await StatusBar.setBackgroundColor({ color: '#2563eb' })
  }
  catch { /* Android only */ }

  try {
    await SplashScreen.hide({ fadeOutDuration: 300 })
  }
  catch { /* ignore */ }

  if (Capacitor.getPlatform() === 'ios') {
    try {
      Keyboard.addListener('keyboardWillShow', (info) => {
        document.documentElement.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`)
      })
      Keyboard.addListener('keyboardWillHide', () => {
        document.documentElement.style.setProperty('--keyboard-height', '0px')
      })
    }
    catch { /* ignore */ }
  }

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back()
    }
    else {
      App.exitApp()
    }
  })
})
