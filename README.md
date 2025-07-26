🔸 Step 1: Design Component Hierarchy
Break down the calendar into smaller, modular, reusable components:

sql
Copy
Edit
📁 components/Calendar/
│
├── 📄 Calendar.tsx           → Main component: holds state, renders header, body, and view toggle
├── 📄 CalendarHeader.tsx     → Controls month/year navigation and "Today" button
├── 📄 ViewToggleButtons.tsx  → Switch between Daily, Weekly, Monthly views
├── 📄 CalendarBody.tsx       → Renders grid layout based on view
├── 📄 CalendarCell.tsx       → Represents a single day/week/month cell
🔸 Step 2: Set Up Date Utilities (with Day.js)
Use the dayjs library to help calculate:

Current month/year

Start/end of the current view range (week/month)

Whether a date is today

Whether a date is within the selected month

You'll also need utilities to:

Generate an array of days for the monthly view (e.g., 5x7 grid)

Generate a week of days (for daily view)

Aggregate weeks for weekly view

Tip: Create a file like utils/dateHelpers.ts to organize these helpers.

🔸 Step 3: Implement View Logic
Your calendar should support 3 views:

View	Description	Layout
Daily View	1 row showing 7 days (current week)	Horizontal
Weekly View	4–6 rows showing weeks of the month	Vertical grid
Monthly View	Month grid with day-based cells (heatmap style)	5x7 grid

Use a state variable like viewMode ("day" | "week" | "month") to toggle.

🔸 Step 4: Month/Year Navigation
In CalendarHeader:

Show current Month + Year

Add "← Prev" and "Next →" buttons

Add "Today" button

Behavior:

Clicking prev/next should shift the date range backward/forward (based on current view).

“Today” resets to current date and current view.

Use state like currentDate (dayjs() object) in the main Calendar component.

🔸 Step 5: Keyboard Navigation Support
Enable these keys:

Arrow Keys: Navigate between dates

←: previous day

→: next day

↑: previous week

↓: next week

Enter: Select focused date

Escape: Exit selection mode

Track the currently focused date in state.

Add tabIndex=0 to the focused cell

Use onKeyDown in the calendar container

🔸 Step 6: Accessibility
Ensure WCAG-compliant structure:

Use role="grid" on CalendarBody

Use role="gridcell" on CalendarCell

Add aria-selected="true" to the selected date

Use aria-label to describe dates

Keyboard navigation focus should be clearly visible (use Tailwind focus:outline, etc.)

✅ Summary of What You Should Have After Phase 2:
✅ A working calendar layout with responsive grid

✅ Navigation for month/year and reset to today

✅ Toggle between daily/weekly/monthly view

✅ Keyboard arrow key navigation support

✅ Focused date and selected date state tracking

✅ Proper ARIA roles and keyboard accessibility

