// Header scroll functionality
let lastScrollTop = 0
let scrollTimeout

function handleScroll() {
  const header = document.querySelector(".header")
  const currentScroll = window.pageYOffset || document.documentElement.scrollTop

  // Add scrolled class when scrolled down
  if (currentScroll > 50) {
    header.classList.add("scrolled")
  } else {
    header.classList.remove("scrolled")
  }

  // Hide/show header based on scroll direction
  if (currentScroll > lastScrollTop && currentScroll > 100) {
    // Scrolling down & past threshold
    header.classList.add("hidden")
  } else {
    // Scrolling up
    header.classList.remove("hidden")
  }

  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll

  // Clear timeout and set new one
  clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    // Always show header when scrolling stops
    header.classList.remove("hidden")
  }, 150)
}

// Throttled scroll event
let ticking = false
function requestTick() {
  if (!ticking) {
    requestAnimationFrame(handleScroll)
    ticking = true
    setTimeout(() => {
      ticking = false
    }, 10)
  }
}

// Add scroll event listener
window.addEventListener("scroll", requestTick, { passive: true })

// Touch events for mobile
let touchStartY = 0
let touchEndY = 0

document.addEventListener(
  "touchstart",
  (e) => {
    touchStartY = e.changedTouches[0].screenY
  },
  { passive: true },
)

document.addEventListener(
  "touchend",
  (e) => {
    touchEndY = e.changedTouches[0].screenY
    handleSwipe()
  },
  { passive: true },
)

function handleSwipe() {
  const header = document.querySelector(".header")
  const swipeThreshold = 50

  if (touchStartY - touchEndY > swipeThreshold) {
    // Swiping up (scrolling down)
    if (window.pageYOffset > 100) {
      header.classList.add("hidden")
    }
  } else if (touchEndY - touchStartY > swipeThreshold) {
    // Swiping down (scrolling up)
    header.classList.remove("hidden")
  }
}

// Show header when hovering near top of screen
document.addEventListener(
  "mousemove",
  (e) => {
    const header = document.querySelector(".header")
    if (e.clientY < 100) {
      header.classList.remove("hidden")
    }
  },
  { passive: true },
)
// Global Variables
let timerInterval
let timeLeft = 25 * 60 // 25 minutes in seconds
let isRunning = false
let isBreak = false
let sessionsCompleted = 0
let waterIntake = 0
let exercises = []

// DOM Elements
const timerDisplay = document.getElementById("timer-display")
const timerStatus = document.getElementById("timer-status")
const timerToggle = document.getElementById("timer-toggle")
const timerReset = document.getElementById("timer-reset")
const sessionsCount = document.getElementById("sessions-count")
const progressCircle = document.getElementById("progress-circle")

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  initializeTabs()
  initializeTimer()
  initializeChat()
  initializeFitnessTracker()
  initializeWaterTracker()
  initializeCalorieCalculator()
  requestNotificationPermission()
})

// Tab Functionality
function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab")

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to clicked button and corresponding content
      button.classList.add("active")
      document.getElementById(targetTab).classList.add("active")
    })
  })
}

// Pomodoro Timer
function initializeTimer() {
  updateTimerDisplay()

  timerToggle.addEventListener("click", toggleTimer)
  timerReset.addEventListener("click", resetTimer)
}

function toggleTimer() {
  if (isRunning) {
    pauseTimer()
  } else {
    startTimer()
  }
}

function startTimer() {
  isRunning = true
  timerToggle.innerHTML = '<i class="fas fa-pause"></i> Pause'

  timerInterval = setInterval(() => {
    timeLeft--
    updateTimerDisplay()
    updateProgress()

    if (timeLeft <= 0) {
      timerComplete()
    }
  }, 1000)
}

function pauseTimer() {
  isRunning = false
  timerToggle.innerHTML = '<i class="fas fa-play"></i> Start'
  clearInterval(timerInterval)
}

function resetTimer() {
  pauseTimer()
  isBreak = false
  timeLeft = 25 * 60
  updateTimerDisplay()
  updateProgress()
}

function timerComplete() {
  pauseTimer()

  if (isBreak) {
    // Break finished, start work session
    isBreak = false
    timeLeft = 25 * 60
    timerStatus.textContent = "Focus Time"
    showNotification("Break time over!", "Time to get back to work!")
  } else {
    // Work session finished, start break
    sessionsCompleted++
    sessionsCount.textContent = sessionsCompleted
    isBreak = true
    timeLeft = 5 * 60
    timerStatus.textContent = "Break Time"
    showNotification("Work session complete!", "Time for a well-deserved break!")
  }

  updateTimerDisplay()
  updateProgress()
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

  timerStatus.textContent = isBreak ? "Break Time" : "Focus Time"
}

function updateProgress() {
  const totalTime = isBreak ? 5 * 60 : 25 * 60
  const progress = ((totalTime - timeLeft) / totalTime) * 565.48
  progressCircle.style.strokeDashoffset = 565.48 - progress
}

// Chat Functionality
function initializeChat() {
  const studyInput = document.getElementById("study-input")
  const studySend = document.getElementById("study-send")

  studySend.addEventListener("click", () => sendStudyMessage())
  studyInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendStudyMessage()
  })
}

function sendStudyMessage() {
  const input = document.getElementById("study-input")
  const message = input.value.trim()

  if (!message) return

  addMessageToChat("study-chat", message, false)
  input.value = ""

  // Simulate bot response
  setTimeout(() => {
    const response = getStudyBotResponse(message)
    addMessageToChat("study-chat", response, true)
  }, 1000)
}

function getStudyBotResponse(message) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("reminder") || lowerMessage.includes("remind")) {
    return "I can help you set study reminders! Try setting specific goals like 'Study math for 2 hours' or 'Review notes at 3 PM'. What would you like to be reminded about?"
  } else if (lowerMessage.includes("break") || lowerMessage.includes("tired")) {
    return "It sounds like you might need a break! Remember, taking regular breaks actually improves focus and retention. Try the 5-minute break timer or take a short walk."
  } else if (lowerMessage.includes("focus") || lowerMessage.includes("concentrate")) {
    return "Here are some focus tips: 1) Use the Pomodoro technique, 2) Remove distractions, 3) Set clear goals, 4) Stay hydrated. You're doing great by using the study timer!"
  } else if (lowerMessage.includes("progress") || lowerMessage.includes("session")) {
    return `Great question! You've completed ${sessionsCompleted} study sessions today. Each session helps build your focus muscle. Keep up the excellent work!`
  } else {
    return "I'm here to help with your studies! I can provide study tips, set reminders, track your progress, or just offer encouragement. What do you need help with?"
  }
}

function addMessageToChat(chatId, message, isBot) {
  const chatContainer = document.getElementById(chatId)
  const messageDiv = document.createElement("div")
  messageDiv.className = `message ${isBot ? "bot-message" : "user-message"}`

  const avatarIcon = isBot ? (chatId === "study-chat" ? "fas fa-robot" : "fas fa-apple-alt") : "fas fa-user"

  messageDiv.innerHTML = `
        <div class="message-avatar ${isBot ? "bot-avatar" : "user-avatar"}">
            <i class="${avatarIcon}"></i>
        </div>
        <div class="message-content">${message}</div>
    `

  chatContainer.appendChild(messageDiv)
  chatContainer.scrollTop = chatContainer.scrollHeight
}

// Fitness Tracker
function initializeFitnessTracker() {
  const addExerciseBtn = document.getElementById("add-exercise")
  addExerciseBtn.addEventListener("click", addExercise)

  document.getElementById("exercise-duration").addEventListener("keypress", (e) => {
    if (e.key === "Enter") addExercise()
  })
}

function addExercise() {
  const nameInput = document.getElementById("exercise-name")
  const durationInput = document.getElementById("exercise-duration")

  const name = nameInput.value.trim()
  const duration = Number.parseInt(durationInput.value)

  if (!name || !duration) return

  const calories = calculateCalories(name, duration)
  const exercise = {
    id: Date.now(),
    name,
    duration,
    calories,
    timestamp: new Date(),
  }

  exercises.push(exercise)
  updateExerciseDisplay()
  updateFitnessStats()

  nameInput.value = ""
  durationInput.value = ""
}

function calculateCalories(exercise, minutes) {
  const calorieRates = {
    running: 10,
    walking: 5,
    cycling: 8,
    swimming: 12,
    yoga: 3,
    weightlifting: 6,
    dancing: 7,
    hiking: 6,
  }

  const exerciseLower = exercise.toLowerCase()
  const rate = Object.keys(calorieRates).find((key) => exerciseLower.includes(key)) || "default"
  return Math.round((calorieRates[rate] || 5) * minutes)
}

function updateExerciseDisplay() {
  const exerciseList = document.getElementById("exercise-list")

  if (exercises.length === 0) {
    exerciseList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-dumbbell"></i>
                <p>No exercises logged yet</p>
            </div>
        `
    return
  }

  exerciseList.innerHTML = exercises
    .map(
      (exercise) => `
        <div class="exercise-item">
            <div class="exercise-info">
                <h4>${exercise.name}</h4>
                <div class="exercise-details">${exercise.duration} min • ${exercise.calories} cal</div>
            </div>
            <button class="btn btn-small btn-secondary" onclick="removeExercise(${exercise.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `,
    )
    .join("")
}

function removeExercise(id) {
  exercises = exercises.filter((ex) => ex.id !== id)
  updateExerciseDisplay()
  updateFitnessStats()
}

function updateFitnessStats() {
  const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories, 0)
  const totalMinutes = exercises.reduce((sum, ex) => sum + ex.duration, 0)

  document.getElementById("total-calories").textContent = totalCalories
  document.getElementById("total-minutes").textContent = totalMinutes
}

// Water Tracker
function initializeWaterTracker() {
  document.getElementById("add-water").addEventListener("click", () => addWater(250))
  document.getElementById("remove-water").addEventListener("click", () => removeWater(250))
  updateWaterDisplay()
}

function addWater(amount) {
  waterIntake = Math.min(waterIntake + amount, 3000) // Max 3L
  updateWaterDisplay()

  if (waterIntake >= 2000 && waterIntake - amount < 2000) {
    showNotification("Hydration Goal Achieved!", "Congratulations! You've reached your daily water goal! 🎉")
  }
}

function removeWater(amount) {
  waterIntake = Math.max(waterIntake - amount, 0)
  updateWaterDisplay()
}

function updateWaterDisplay() {
  const goal = 2000
  const percentage = Math.round((waterIntake / goal) * 100)

  document.getElementById("water-amount").textContent = `${waterIntake}ml`
  document.getElementById("water-percentage").textContent = `${percentage}%`
  document.getElementById("water-progress").style.width = `${Math.min(percentage, 100)}%`

  // Add success styling when goal is reached
  const waterDisplay = document.querySelector(".water-display")
  if (percentage >= 100) {
    waterDisplay.classList.add("goal-achieved")
  } else {
    waterDisplay.classList.remove("goal-achieved")
  }

  // Add success animation
  if (waterIntake > 0 && waterIntake % 500 === 0) {
    waterDisplay.classList.add("water-success")
    setTimeout(() => {
      waterDisplay.classList.remove("water-success")
    }, 600)
  }
}

// Calorie Calculator
function initializeCalorieCalculator() {
  const calorieInput = document.getElementById("calorie-input")
  const calorieSend = document.getElementById("calorie-send")

  calorieSend.addEventListener("click", sendCalorieMessage)
  calorieInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendCalorieMessage()
  })
}

function sendCalorieMessage() {
  const input = document.getElementById("calorie-input")
  const message = input.value.trim()

  if (!message) return

  addMessageToChat("calorie-chat", message, false)
  input.value = ""

  setTimeout(() => {
    const response = getCalorieBotResponse(message)
    addMessageToChat("calorie-chat", response, true)
  }, 1000)
}

function getCalorieBotResponse(message) {
  const foodDatabase = {
    apple: { name: "Apple", calories: 95, serving: "1 medium" },
    banana: { name: "Banana", calories: 105, serving: "1 medium" },
    "chicken breast": { name: "Chicken Breast", calories: 165, serving: "100g" },
    rice: { name: "White Rice", calories: 130, serving: "100g cooked" },
    bread: { name: "Bread", calories: 80, serving: "1 slice" },
    egg: { name: "Egg", calories: 70, serving: "1 large" },
    milk: { name: "Milk", calories: 150, serving: "1 cup" },
    pasta: { name: "Pasta", calories: 220, serving: "100g cooked" },
  }

  const input = message.toLowerCase()
  const quantityMatch = input.match(/(\d+)/)
  const quantity = quantityMatch ? Number.parseInt(quantityMatch[1]) : 1

  const foundFood = Object.keys(foodDatabase).find((food) => input.includes(food))

  if (foundFood) {
    const food = foodDatabase[foundFood]
    const totalCalories = Math.round(food.calories * quantity)
    return `${food.name} (${food.serving}): ${food.calories} calories each. For ${quantity} serving(s): ${totalCalories} calories total.`
  }

  if (input.includes("help")) {
    return "I can help you calculate calories for various foods! Just tell me what you ate, like 'I had 2 eggs' or 'chicken breast 150g'."
  }

  return "I couldn't find that food in my database. Try common foods like apple, banana, chicken breast, rice, bread, egg, milk, or pasta."
}

// Notifications
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission()
  }
}

function showNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: body,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23667eea"/></svg>',
    })
  }
}

// Hydration Reminders (every hour)
setInterval(
  () => {
    if (waterIntake < 1600) {
      // Less than 80% of goal
      showNotification("Hydration Reminder", "Time to drink some water! Stay hydrated! 💧")
    }
  },
  60 * 60 * 1000,
) // Every hour
