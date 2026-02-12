#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Test the CAPTURE territory conquest web app - a mobile-first PWA for territory capturing via running/walking. Test login, setup wizard, map page, ranks/leaderboard, friends page, profile page, and navigation flows."

frontend:
  - task: "Login Page"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/LoginPage.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "testing"
        comment: "Initial testing required - need to verify CAPTURE logo, tagline, Sign In/Sign Up tabs, email/password inputs, mock login functionality, and toast notifications"

  - task: "Setup Wizard"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/SetupPage.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "testing"
        comment: "Initial testing required - need to verify 3-step wizard: display name input, preferences (km/miles, run/walk toggles), color picker with 8 colors, Skip button, and Start Capturing button"

  - task: "Map Page"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/MapPage.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "testing"
        comment: "Initial testing required - need to verify map loads with CartoDB Positron tiles, floating Ready to Run sheet, distance/duration metrics, amber Start Run button, and bottom navigation"

  - task: "Ranks/Leaderboard Page"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/RanksPage.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "testing"
        comment: "Initial testing required - need to verify leaderboard header with trophy icon, user stats card, mock leaderboard data with rankings and crown/medal icons, player cards with stats"

  - task: "Friends Page"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/FriendsPage.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "testing"
        comment: "Initial testing required - need to verify search input, Friends/Requests tabs, friend list with online/offline indicators, friend request section with Accept/Decline buttons"

  - task: "Profile Page"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/pages/ProfilePage.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "testing"
        comment: "Initial testing required - need to verify user profile header with avatar and email, Your Stats grid, Settings menu items, and Log Out button"

  - task: "Bottom Navigation"
    implemented: true
    working: "NA"
    file: "/app/frontend/src/components/BottomNavigation.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "testing"
        comment: "Initial testing required - need to verify navigation between all pages, active state styling, and center FAB button styling (amber colored)"

metadata:
  created_by: "testing_agent"
  version: "1.0"
  test_sequence: 1

test_plan:
  current_focus:
    - "Login Page"
    - "Setup Wizard"
    - "Map Page"
    - "Ranks/Leaderboard Page"
    - "Friends Page"
    - "Profile Page"
    - "Bottom Navigation"
  stuck_tasks: []
  test_all: true
  test_priority: "sequential"

agent_communication:
  - agent: "testing"
    message: "Starting comprehensive testing of CAPTURE territory conquest web app. Will test all major flows including login, setup wizard, map functionality, leaderboard, friends, profile, and navigation. Using test credentials as specified in review request."