-brand-name = Visionneuse Web pour Subsurface
main-title = { -brand-name }
welcome-to-subsurface = Bienvenue sur la { -brand-name }
hello-user = Bonjour { $user }{"\u202f"}!
hide-dive = Cacher
show-dive = Montrer

# The $date, $time, $startTime and $endTime variables are already formatted
# through the use of FluentDateTime.
dive-date = Date{"\u00a0"}: { $date }
dive-time = Durée{"\u00a0"}: { $duration } (de { $startTime } à { $endTime })

# The $depth contains the unit through the use of FluentNumber.
dive-max-depth = Profondeur max{"\u00a0"}: { $depth }

login-summary = S'authentifier sur Subsurface
login-user = Utilisateur{"\u00a0"}:
login-password = Mot de passe{"\u00a0"}:
login-submit = S'authentifier
login-reset = Vider les entrées
login-save-login = Se rappeler des informations d'authentification
login-autologin = S'authentifier automatiquement
login-explanation =
  Les informations d'authentification sont sauvegardées localement sur votre
  ordinateur et sont uniquement envoyeés au serveur Cloud de Subsurface.

graph-axis-time-label = temps (min) →
graph-axis-depth-label = ← profondeur (m)
graph-axis-speed-label = vitesse verticale (m/min)
graph-axis-temperature-label = température de l'eau (°C)
graph-axis-tank-pressure-label = pression du bloc (bar)

# This is used as the title of all tooltips, indicating the duration of the dive
# at this point.
graph-tooltip-title = @: { $minutes }:{ $seconds }
graph-tooltip-depth-label = Profondeur: { $depth }
graph-tooltip-speed-label = Vitesse verticale: { $speed }
graph-tooltip-temperature-label = Température de l'eau: { $temperature }
graph-tooltip-tank-pressure-label = Pression du bloc: { $pressure }{"\u202f"}bar
