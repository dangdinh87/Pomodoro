# Translation Keys Inventory Report
**Date:** 2026-02-12 | **Scout:** Translation Keys Analysis

## Executive Summary
Found **70+ unique translation key prefixes** actively used across the codebase. All keys follow dot-notation pattern: `t("category.subcategory.key")`. This inventory helps resolve merge conflicts in i18n locale files by identifying which keys are actually needed.

## Translation Key Categories (By Prefix)

### 1. **auth** (8 keys)
Core authentication-related strings.
- `auth.login` - "Log In"
- `auth.pleaseLogin` - "Please sign in to continue"
- `auth.signInToManageTasks` - "Please sign in to manage tasks"
- `auth.signInToViewStats` - "Please sign in to view statistics"
- `auth.signInButton` - "Sign In"
- `auth.signOutSuccess` - "Successfully signed out"
- `auth.signOutError` - "Unable to sign out"
- `auth.supabaseNotConfigured` - "Supabase is not configured"
- `auth.signOutUnexpectedError` - "An error occurred while signing out"

### 2. **brand** (2 keys)
Brand/product identity strings.
- `brand.title` - "StudyBro"
- `brand.subtitle` - "Study Together"

### 3. **common** (20+ keys)
Reusable UI component labels.
- `common.loading` - "Loading..."
- `common.error` - "Error"
- `common.success` - "Success"
- `common.cancel` - "Cancel"
- `common.noResults` - "No results found"
- `common.save` - "Save"
- `common.delete` - "Delete"
- `common.edit` - "Edit"
- `common.add` - "Add"
- `common.close` - "Close"
- `common.play` - "Play"
- `common.pause` - "Pause"
- `common.confirm` - "Confirm"
- `common.retry` - "Retry"
- `common.back` - "Back"
- `common.next` - "Next"
- `common.previous` - "Previous"
- `common.submit` - "Submit"
- `common.search` - "Search"
- `common.language` - "Language"
- `common.actions` - "Actions"
- `common.settings` - "Settings"
- `common.total` - "Total"

### 4. **nav** (12 keys)
Navigation menu and sidebar labels.
- `nav.timer` - "Focus"
- `nav.focus` - "Focus"
- `nav.tasks` - "Tasks"
- `nav.history` - "History"
- `nav.leaderboard` - "Leaderboard"
- `nav.entertainment` - "Entertainment"
- `nav.settings` - "Settings"
- `nav.guide` - "Guide"
- `nav.feedback` - "Feedback"
- `nav.login` - "Sign In"
- `nav.logout` - "Sign Out"
- `nav.loginNow` - "Sign in now"
- `nav.audio` - "Audio"

### 5. **timer** (Complex hierarchy)
Pomodoro timer-related strings.
- `timer.modes.work` - "Work"
- `timer.modes.shortBreak` - "Short Break"
- `timer.modes.longBreak` - "Long Break"
- `timer.controls.start` - "Start"
- `timer.controls.pause` - "Pause"
- `timer.controls.reset` - "Reset"
- `timer.controls.skip` - "Skip"
- `timer.title_prefix.work` - "Work"
- `timer.title_prefix.shortBreak` - "Break"
- `timer.title_prefix.longBreak` - "Long Break"

### 6. **login** (18+ keys)
Login page form and messages.
- `login.title`
- `login.description`
- `login.form.email`
- `login.form.emailPlaceholder`
- `login.form.password`
- `login.form.passwordPlaceholder`
- `login.form.forgotPassword`
- `login.form.signingIn`
- `login.form.signIn`
- `login.form.or`
- `login.form.continueWithGoogle`
- `login.form.noAccount`
- `login.form.signUpNow`
- `login.form.backToApp`
- `login.errors.supabaseNotConfigured`
- `login.errors.emailPasswordRequired`
- `login.errors.loginFailed`
- `login.errors.loginError`
- `login.errors.googleConnectionFailed`
- `login.errors.googleAuthError`
- `login.success.loginSuccess`
- `login.success.redirectingToGoogle`
- `login.forgot.title`
- `login.forgot.description`
- `login.forgot.emailRequired`
- `login.forgot.error`
- `login.forgot.success`
- `login.forgot.sending`
- `login.forgot.sendLink`

### 7. **signup** (12+ keys)
Signup page form and messages.
- `signup.title`
- `signup.description`
- `signup.form.email`
- `signup.form.emailPlaceholder`
- `signup.form.password`
- `signup.form.passwordPlaceholder`
- `signup.form.signingUp`
- `signup.form.signUp`
- `signup.form.or`
- `signup.form.signUpWithGoogle`
- `signup.form.haveAccount`
- `signup.form.signInNow`
- `signup.form.backToApp`
- `signup.errors.supabaseNotConfigured`
- `signup.errors.emailPasswordRequired`
- `signup.errors.signupFailed`
- `signup.errors.signupError`
- `signup.errors.googleConnectionFailed`
- `signup.errors.googleAuthError`
- `signup.success.checkEmail`
- `signup.success.redirectingToGoogle`

### 8. **resetPassword** (8+ keys)
Password reset flow.
- `resetPassword.title`
- `resetPassword.description`
- `resetPassword.invalidTitle`
- `resetPassword.invalidDescription`
- `resetPassword.newPassword`
- `resetPassword.newPasswordPlaceholder`
- `resetPassword.confirmPassword`
- `resetPassword.confirmPasswordPlaceholder`
- `resetPassword.updating`
- `resetPassword.submit`
- `resetPassword.errors.passwordTooShort`
- `resetPassword.errors.passwordMismatch`
- `resetPassword.errors.updateFailed`
- `resetPassword.success`

### 9. **tasks** (25+ keys)
Task management feature.
- `tasks.title`
- `tasks.subtitle`
- `tasks.addTask`
- `tasks.editTask`
- `tasks.taskName`
- `tasks.taskNamePlaceholder`
- `tasks.taskDescription`
- `tasks.taskDescriptionPlaceholder`
- `tasks.estimated`
- `tasks.priority`
- `tasks.dueDate`
- `tasks.status`
- `tasks.noTasks`
- `tasks.noTasksDescription`
- `tasks.manageTags`
- `tasks.manageTagsDescription`
- `tasks.newTagPlaceholder`
- `tasks.tagsLimit` - "10"
- `tasks.noTags`
- `tasks.focusing` - "Focusing"
- `tasks.templateBadge`
- `tasks.count`
- `tasks.actions.create` - "Create"
- `tasks.actions.edit` - "Edit"
- `tasks.actions.delete` - "Delete"
- `tasks.actions.clone` - "Clone"
- `tasks.actions.saveAsTemplate` - "Save as template"
- `tasks.actions.deletePermanent` - "Delete permanently"
- `tasks.actions.markComplete` - "Mark complete"
- `tasks.actions.markIncomplete` - "Mark incomplete"
- `tasks.priorityLevels.low` - "Low"
- `tasks.priorityLevels.medium` - "Medium"
- `tasks.priorityLevels.high` - "High"
- `tasks.statuses.todo` - "To Do"
- `tasks.statuses.doing` - "Doing"
- `tasks.statuses.done` - "Done"
- `tasks.templates.title` - "Templates"
- `tasks.templates.description`
- `tasks.templates.empty`
- `tasks.templates.emptyHint`
- `tasks.templates.useTemplate`
- `tasks.confirmDelete.title`
- `tasks.confirmDelete.description`
- `tasks.confirmDelete.action`
- `tasks.fields.title` - "Title"
- `tasks.fields.priority` - "Priority"
- `tasks.fields.dueDate` - "Due Date"
- `tasks.fields.tags` - "Tags"
- `tasks.fields.progress` - "Progress"

### 10. **history** (10+ keys)
History/statistics page.
- `history.title`
- `history.subtitle`
- `history.startNewSession`
- `history.errorLoading`
- `history.charts.focusOverview`
- `history.charts.noTask`
- `history.dateRange.today`
- `history.dateRange.yesterday`
- `history.dateRange.last7Days`

### 11. **historyComponents** (20+ keys)
Sub-components in history page.
- `historyComponents.sessionHistory.title`
- `historyComponents.sessionHistory.tableHeaders.task`
- `historyComponents.sessionHistory.tableHeaders.sessionType`
- `historyComponents.sessionHistory.tableHeaders.dateTime`
- `historyComponents.sessionHistory.tableHeaders.duration`
- `historyComponents.sessionHistory.modes.focus`
- `historyComponents.sessionHistory.modes.shortBreak`
- `historyComponents.sessionHistory.modes.longBreak`
- `historyComponents.sessionHistory.noTask`
- `historyComponents.sessionHistory.minutes` (interpolated)
- `historyComponents.sessionHistory.noData`
- `historyComponents.statsCards.totalFocusTime`
- `historyComponents.statsCards.completedSessions`
- `historyComponents.statsCards.longestStreak`
- `historyComponents.statsCards.currentStreak` (interpolated)
- `historyComponents.statsCards.days` (interpolated)
- `historyComponents.statsCards.timeFormat` (interpolated: hours, minutes)
- `historyComponents.distributionChart.title`
- `historyComponents.distributionChart.minutes` (interpolated)
- `historyComponents.distributionChart.time`
- `historyComponents.distributionChart.total`
- `historyComponents.focusChart.title`
- `historyComponents.focusChart.minutes` (interpolated)
- `historyComponents.statsEmpty.title`
- `historyComponents.statsEmpty.description`
- `historyComponents.statsEmpty.startFocus`
- `historyComponents.dateRangePicker.selectRange`
- `historyComponents.dateRangePicker.presets.today`
- `historyComponents.dateRangePicker.presets.last3Days`
- `historyComponents.dateRangePicker.presets.last7Days`
- `historyComponents.dateRangePicker.presets.last30Days`
- `historyComponents.dateRangePicker.presets.thisMonth`

### 12. **timerSettings** (20+ keys)
Timer configuration panel.
- `timerSettings.title`
- `timerSettings.labels.timerDurations`
- `timerSettings.labels.workDuration`
- `timerSettings.labels.shortBreakDuration`
- `timerSettings.labels.longBreakDuration`
- `timerSettings.labels.longBreakInterval`
- `timerSettings.labels.behavior`
- `timerSettings.labels.autoStartBreaks`
- `timerSettings.labels.autoStartWork`
- `timerSettings.labels.lowTimeWarning`
- `timerSettings.labels.clockDisplay`
- `timerSettings.labels.clockStyle`
- `timerSettings.labels.selectClockType`
- `timerSettings.labels.digital`
- `timerSettings.labels.analog`
- `timerSettings.labels.flip`
- `timerSettings.labels.clockSize`
- `timerSettings.labels.selectSize`
- `timerSettings.labels.small`
- `timerSettings.labels.medium`
- `timerSettings.labels.large`
- `timerSettings.labels.preview`
- `timerSettings.actions.save`
- `timerSettings.actions.saveChanges`
- `timerSettings.actions.resetDefaults`
- `timerSettings.toasts.saved`
- `timerSettings.toasts.reset`

### 13. **timerGuide** (20+ keys)
Timer guide/help dialog.
- `timerGuide.title`
- `timerGuide.subtitle`
- `timerGuide.modes.title`
- `timerGuide.modes.work`
- `timerGuide.modes.workDesc`
- `timerGuide.modes.shortBreak`
- `timerGuide.modes.shortBreakDesc`
- `timerGuide.modes.longBreak`
- `timerGuide.modes.longBreakDesc`
- `timerGuide.validSession.title`
- `timerGuide.validSession.subtitle`
- `timerGuide.validSession.rule`
- `timerGuide.validSession.ruleDesc`
- `timerGuide.validSession.skip`
- `timerGuide.validSession.skipDesc`
- `timerGuide.validSession.badge`
- `timerGuide.task.title`
- `timerGuide.task.select`
- `timerGuide.task.auto`
- `timerGuide.keyboard.title`
- `timerGuide.keyboard.space`
- `timerGuide.keyboard.reset`
- `timerGuide.settings.title`
- `timerGuide.settings.customize`
- `timerGuide.settings.autoStart`
- `timerGuide.settings.openSettings`
- `timerGuide.dontShowAgain`
- `timerGuide.gotIt`

### 14. **timerComponents** (5+ keys)
Timer UI components.
- `timerComponents.enhancedTimer.today`
- `timerComponents.enhancedTimer.poms`
- `timerComponents.enhancedTimer.time`
- `timerComponents.enhancedTimer.minutes`
- `timerComponents.enhancedTimer.focusMode`

### 15. **audio** (20+ keys)
Audio/ambient sounds system.
- `audio.selectAudio`
- `audio.tabs.ambient`
- `audio.tabs.youtube`
- `audio.ambient.active`
- `audio.ambient.title`
- `audio.ambient.playing`
- `audio.ambient.stopAll`
- `audio.ambient.pausedAlert.title`
- `audio.ambient.pausedAlert.description`
- `audio.youtube.status.playing`
- `audio.youtube.status.paused`
- `audio.youtube.nowPlaying`
- `audio.youtube.soundSettings`
- `audio.youtube.close`
- `audio.youtube.channelLink`
- `audio.youtube.playBackground`
- `audio.youtube.placeholder`
- `audio.youtube.invalidLink`
- `audio.youtube.library`
- `audio.youtube.random`
- `audio.presets.library`
- `audio.presets.saveMix`
- `audio.presets.rename`
- `audio.presets.delete`
- `audio.presets.savePresetTitle`
- `audio.presets.savePresetDescription` (interpolated)
- `audio.presets.icon`
- `audio.presets.iconPlaceholder`
- `audio.presets.name`
- `audio.presets.namePlaceholder`
- `audio.presets.newName`
- `audio.presets.newNamePlaceholder`
- `audio.presets.cancel`
- `audio.presets.save`
- `audio.presets.rename` (button variant)

### 16. **settings** (30+ keys)
Settings panels.
- `settings.title`
- `settings.tabs.general`
- `settings.tabs.timer`
- `settings.tabs.background`
- `settings.background.selectImage`
- `settings.background.saveChanges`
- `settings.background.topTabs.myImages`
- `settings.background.topTabs.cozy`
- `settings.background.topTabs.nature`
- etc. (see background sub-keys)
- `settings.background.sliderDisabledHint`
- `settings.background.sliderHint`
- `settings.background.opacity`
- `settings.background.opacityDescription`
- `settings.background.brightness`
- `settings.background.brightnessDescription`
- `settings.background.blur`
- `settings.background.blurDescription`
- `settings.background.reset`
- `settings.background.customImages.urlPlaceholder`
- `settings.background.customImages.uploadSuccess`
- `settings.background.customImages.addUrl`
- `settings.background.customImages.or`
- `settings.background.customImages.uploadFile`
- `settings.background.customImages.limit2MB`
- `settings.background.customImages.current`
- `settings.background.customImages.replaceNotice`
- `settings.background.customImages.empty`
- `settings.background.toasts.saved`
- `settings.background.toasts.resetInfo`

### 17. **entertainment** (20+ keys)
Entertainment/games feature.
- `entertainment.title`
- `entertainment.subtitle`
- `entertainment.gamesCount` (interpolated)
- `entertainment.startGame`
- `entertainment.playNow`
- `entertainment.yourBest`
- `entertainment.howToPlay`
- `entertainment.tips`
- `entertainment.controls`
- `entertainment.instructions`
- `entertainment.games.snake.title`
- `entertainment.games.memoryMatch.title`
- `entertainment.games.memoryMatch.instructions`
- `entertainment.games.memoryMatch.moves`
- `entertainment.games.memoryMatch.win`
- `entertainment.games.memoryMatch.clicks`
- `entertainment.games.memoryMatch.time`
- `entertainment.games.memoryMatch.reset`
- `entertainment.games.spaceShooter.title`
- `entertainment.games.ticTacToe.title`
- `entertainment.games.ticTacToe.instructions`
- `entertainment.games.ticTacToe.mode3x3`
- `entertainment.games.ticTacToe.mode3x3Desc`
- `entertainment.games.ticTacToe.mode4x4`
- `entertainment.games.ticTacToe.mode4x4Desc`
- `entertainment.games.ticTacToe.aiThinking`
- `entertainment.games.ticTacToe.yourTurn`
- `entertainment.games.ticTacToe.gameOver`
- `entertainment.games.ticTacToe.you`
- `entertainment.games.ticTacToe.ai`
- `entertainment.games.ticTacToe.newGame`
- `entertainment.games.ticTacToe.youWin`
- `entertainment.games.ticTacToe.aiWins`
- `entertainment.games.ticTacToe.draw`
- `entertainment.games.brickBreaker.title`
- `entertainment.games.brickBreaker.instructions`
- `entertainment.games.brickBreaker.start`
- `entertainment.games.brickBreaker.levelComplete`
- `entertainment.games.brickBreaker.score`
- `entertainment.games.brickBreaker.nextLevel`
- `entertainment.games.brickBreaker.gameOver`
- `entertainment.games.brickBreaker.finalScore`
- `entertainment.games.brickBreaker.reachedLevel`
- `entertainment.games.brickBreaker.playAgain`
- `entertainment.games.game2048.instructions`
- `entertainment.games.game2048.score`
- `entertainment.games.game2048.best`
- `entertainment.games.game2048.youWin`
- `entertainment.games.game2048.keepGoing`
- `entertainment.games.game2048.continue`
- `entertainment.games.game2048.newGame`

### 18. **leaderboard** (5+ keys)
Leaderboard feature.
- `leaderboard.title`
- `leaderboard.description`
- `leaderboard.tabs.focusTime`
- `leaderboard.tabs.completedTasks`
- `leaderboard.empty`
- `leaderboard.you`

### 19. **chat** (20+ keys)
AI chat feature.
- `chat.newChat`
- `chat.subtitle`
- `chat.historyTitle`
- `chat.noConversations`
- `chat.deleteConfirmTitle`
- `chat.deleteConfirmDescription`
- `chat.conversationGroups.older`
- `chat.thread.welcome`
- `chat.thread.welcomeSubtitle`
- `chat.thread.instruction`
- `chat.thread.inputPlaceholder`
- `chat.thread.sendMessage`
- `chat.thread.generating`
- `chat.thread.error`
- `chat.thread.copy`
- `chat.thread.exportMarkdown`
- `chat.thread.refresh`
- `chat.thread.edit`
- `chat.thread.cancel`
- `chat.thread.update`
- `chat.thread.previous`
- `chat.thread.next`
- `chat.thread.scrollToBottom`
- `chat.thread.suggestions.pomodoro.title`
- `chat.thread.suggestions.pomodoro.label`
- `chat.thread.suggestions.pomodoro.prompt`
- `chat.thread.suggestions.studyTips.title`
- `chat.thread.suggestions.studyTips.label`
- `chat.thread.suggestions.studyTips.prompt`
- `chat.thread.suggestions.studyPlan.title`
- `chat.thread.suggestions.studyPlan.label`
- `chat.thread.suggestions.studyPlan.prompt`
- `chat.thread.suggestions.breakActivities.title`
- `chat.thread.suggestions.breakActivities.label`
- `chat.thread.suggestions.breakActivities.prompt`

### 20. **feedback** (12+ keys)
Feedback/contact form.
- `feedback.title`
- `feedback.subtitle`
- `feedback.success.title`
- `feedback.success.message`
- `feedback.success.cta`
- `feedback.form.type`
- `feedback.form.rating`
- `feedback.form.message`
- `feedback.form.required`
- `feedback.form.messagePlaceholder`
- `feedback.form.name`
- `feedback.form.namePlaceholder`
- `feedback.form.email`
- `feedback.form.emailPlaceholder`
- `feedback.form.submit`
- `feedback.toast.success`
- `feedback.toast.error`

### 21. **landing** (30+ keys)
Landing page content.
- `landing.nav.features`
- `landing.nav.pricing`
- `landing.nav.contact`
- `landing.hero.getStarted`
- `landing.howItWorks.title`
- `landing.howItWorks.titleHighlight`
- `landing.howItWorks.steps.step1.title`
- `landing.howItWorks.steps.step1.description`
- `landing.howItWorks.steps.step2.title`
- `landing.howItWorks.steps.step2.description`
- `landing.howItWorks.steps.step3.title`
- `landing.howItWorks.steps.step3.description`
- `landing.cta.badge`
- `landing.cta.title`
- `landing.cta.titleHighlight`
- `landing.cta.subtitle`
- `landing.cta.getStarted`
- `landing.cta.tryDemo`
- `landing.features.title`
- `landing.features.titleHighlight`
- `landing.features.subtitle`
- `landing.pricing.badge`
- `landing.pricing.title`
- `landing.pricing.titleHighlight`
- `landing.pricing.subtitle`
- `landing.pricing.noCreditCard`
- `landing.pricing.freeForever`
- `landing.pricing.cancelAnytime`
- `landing.pricing.forever`
- `landing.pricing.free.name`
- `landing.pricing.free.description`
- `landing.pricing.free.features.timer`
- `landing.pricing.free.features.tasks`
- `landing.pricing.free.features.history`
- `landing.pricing.free.features.chatAI`
- `landing.pricing.free.features.games`
- `landing.pricing.free.features.leaderboard`
- `landing.pricing.free.features.focus`
- `landing.pricing.free.features.themes`
- `landing.pricing.free.features.sounds`
- `landing.pricing.free.features.stats`
- `landing.pricing.free.cta`
- `landing.pricing.pro.name`
- `landing.pricing.pro.description`
- `landing.pricing.pro.includesEverything`
- `landing.pricing.pro.features.unlimited`
- `landing.pricing.pro.features.fullHistory`
- `landing.pricing.pro.features.sounds`
- `landing.pricing.pro.features.advanced`
- `landing.pricing.pro.features.cloudSync`
- `landing.pricing.pro.features.themes`
- `landing.pricing.pro.features.priority`
- `landing.pricing.pro.cta`
- `landing.pricing.pro.comingSoon`
- `landing.pricing.pro.brewingTitle`
- `landing.pricing.pro.brewingSubtitle`
- `landing.footer.links.features`
- `landing.footer.links.pricing`
- `landing.footer.links.privacy`
- `landing.footer.links.terms`
- `landing.footer.rightsReserved`

### 22. **errors** (2+ keys)
Error messages.
- `errors.fieldRequired`
- `errors.notFound`

## Usage Patterns

### Interpolated Keys
These keys use dynamic values passed as parameters:
- `timerSettings.timeFormat` - `{ hours, minutes }`
- `historyComponents.statsCards.currentStreak` - `{ current }`
- `historyComponents.statsCards.days` - `{ days }`
- `historyComponents.statsCards.timeFormat` - `{ hours, minutes }`
- `historyComponents.sessionHistory.minutes` - `{ minutes }`
- `audio.presets.savePresetDescription` - `{ activeCount }`
- `entertainment.gamesCount` - `{ count }`

### Conditional Keys
Some components use multiple keys based on state:
- timer control buttons: play/pause toggle
- tasks status: todo/doing/done
- timer modes: work/shortBreak/longBreak

## Recommendations for Merge Conflict Resolution

1. **Identify base structure**: All 3 locale files (en.json, vi.json, ja.json) should have the same top-level categories
2. **Required keys**: Implement all 22+ categories above as minimum
3. **Test strategy**: After merge, verify with grep that all t() calls have matching keys
4. **Completeness check**: Run `grep -r "t\(" src/ | wc -l` to ensure no orphaned keys

## Files Affected by i18n (UU Status)
- `src/i18n/locales/en.json` - Conflict
- `src/i18n/locales/vi.json` - Conflict  
- `src/i18n/locales/ja.json` - Conflict

All conflicts stem from the recent audio system overhaul (phase 1-7) which added new translation keys for audio/preset system.
