-brand-name = Subsurface Web Viewer
main-title = { -brand-name }
welcome-to-subsurface = Welcome to { -brand-name }
hello-user = Hello { $user }!
hide-dive = Hide
show-dive = Show
share-dive = Share
  .title =
    Your data is never stored anywhere. The data for this dive are shared in a
    serialized form within an URL.
url-copied = URL copied!

# The $date, $time, $startTime and $endTime variables are already formatted
# through the use of FluentDateTime.
dive-date = Date: { $date }
dive-time = Duration: { $duration } ({ $startTime } to { $endTime })

# The $depth contains the unit through the use of FluentNumber.
dive-max-depth = Max depth: { $depth }

login-summary = Subsurface login
login-user = User:
login-password = Password:
login-submit = Login
login-reset = Clear
login-save-login = Save login
login-autologin = Login automatically
login-explanation =
  The login information is persisted locally on your computer
  and is only sent to the Subsurface cloud server.

graph-axis-time-label = time (min) →
graph-axis-depth-label = ← depth (m)
graph-axis-speed-label = vertical speed (m/min)
graph-axis-temperature-label = water temperature (°C)
graph-axis-tank-pressure-label = tank pressure (bar)
graph-axis-air-consumption-label = air consumption (bar/min)

# This is used as the title of all tooltips, indicating the duration of the dive
# at this point.
graph-tooltip-title = @: { $minutes }:{ $seconds }
graph-tooltip-depth-label = Depth: { $depth }
graph-tooltip-speed-label = Vertical speed: { $speed }
graph-tooltip-temperature-label = Water temperature: { $temperature }
graph-tooltip-tank-pressure-label = Tank pressure: { $pressure }{"\u202f"}bar
graph-tooltip-air-consumption-label = Air consumption: { $consumption }{"\u202f"}bar/min
graph-label-mean-depth = Avg depth: { $meanDepth }
