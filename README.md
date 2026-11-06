# 📺 TiviMatek5 — IPTV Player for Google TV & Android TV

Полнофункциональный IPTV-плеер в стиле **TiviMate** с поддержкой **Stalker Portal (MAG250), Xtream Codes и M3U/M3U8**, оптимизированный под **Google TV / Android TV** и управление стандартным пультом (**D-Pad**).

---

## 🚀 Скачать готовый `.apk` для Google TV

После отправки изменений в репозиторий GitHub Actions автоматически собирает и публикует готовый установочный файл:

- 📦 **Прямая ссылка на последний релиз:**  
  [`TiviMatek5-GoogleTV.apk` в разделе Releases](https://github.com/udemika/Tivimatek5/releases/latest)
- ⚙️ **Статус сборки APK:**  
  [Вкладка GitHub Actions → Build Google TV APK](https://github.com/udemika/Tivimatek5/actions)

---

## 🛠️ Что исправлено и оптимизировано под Google TV

1. **Нативная интеграция с Google TV Launcher (`plugins/withGoogleTV.js`):**
   - Добавлен `android.intent.category.LEANBACK_LAUNCHER` и `android.software.leanback`, благодаря чему иконка **TiviMatek5 TV** появляется прямо на главном экране Google TV (без необходимости Sideload Launcher).
   - Установлена альбомная ориентация экрана (`landscape` / `sensorLandscape`) вместо мобильной портретной (`portrait`).
   - Включён `android:usesCleartextTraffic="true"` для беспрепятственного воспроизведения `http://` IPTV-потоков (`.ts`, `.m3u8`) и Stalker-порталов.

2. **Полноценное управление пультом ТВ (`hooks/useTVRemote.ts` + `MainActivity.kt`):**
   - В React Native 0.81 устаревший `TVEventHandler` был удалён, из-за чего пульт не работал в плеере. Теперь `MainActivity.kt` перехватывает нажатия `KeyEvent` и передаёт их через `DeviceEventEmitter` (`onTVKeyEvent`).
   - Добавлена яркая рамка фокуса (**D-Pad Focus Ring**) для бокового меню (`Sidebar`), списка категорий (`GroupList`) и списка каналов (`ChannelList`).
   - **Кнопки пульта во время просмотра канала:**
     - `▲ Вверх` / `CH+` — предыдущий канал (с всплывающим OSD-индикатором канала)
     - `▼ Вниз` / `CH-` — следующий канал
     - `◀ Влево` / `▶ Вправо` — перемотка -30с / +30с (в режиме архива Catch-Up) или вызов нижней панели
     - `OK / Центр` — показать/скрыть панель управления и инфо-бар передачи
     - `Play / Pause` — пауза / продолжение воспроизведения
     - `Menu / Guide / Info` — открыть сетку телепрограммы (EPG поверх видео)
     - `Назад (Back)` — закрыть открытое меню/EPG или вернуться к списку каналов

3. **Исправление критических ошибок на Android:**
   - **Исправлен краш Stalker Portal (`AbortSignal.timeout`):** В движке Hermes на Android метод `AbortSignal.timeout` отсутствует и вызывал ошибку при подключении к любому Stalker-порталу. Заменён на кроссплатформенный `fetchWithTimeout` через `AbortController`.
   - **Исправлен лимит 2 МБ `AsyncStorage` (`CursorWindow`):** Большие плейлисты (1900+ каналов и 5000+ фильмов) теперь автоматически разбиваются на чанки по 350 КБ (`savePlaylistsChunked` / `loadPlaylistsChunked`) и не вызывают сбой SQLite на Android TV.
   - **Исправлена группа `Favorites` в `ChannelList` и `EPGGrid`:** Выбор категории «Избранное» теперь корректно отображает избранные каналы и их EPG-программу.
   - **Исправлена автолинковка нативных модулей (`package.json` + `.npmrc`):** Все пакеты Expo и React Native перенесены из `devDependencies` в `dependencies` с `node-linker=hoisted` для корректной сборки Gradle APK.

---

## 📲 Как установить на Google TV / Android TV

1. На телевизоре откройте **Настройки → Система → Об устройстве** и нажмите 7 раз на **«Сборка ОС Android TV»**, чтобы включить режим разработчика.
2. В приложении **Downloader by AFTVnews** (из Google Play на ТВ) введите ссылку на релиз:
   ```
   https://github.com/udemika/Tivimatek5/releases/latest/download/TiviMatek5-GoogleTV.apk
   ```
   *(Либо передайте скачанный `TiviMatek5-GoogleTV.apk` со смартфона/ПК через приложение **Send Files to TV** / **LocalSend** или по ADB: `adb install TiviMatek5-GoogleTV.apk`).*
