document.addEventListener('DOMContentLoaded', () => {
  // --- Constants and Breakpoint ---
  const DESKTOP_BREAKPOINT = 1024; // Use 1024px as the breakpoint for 'desktop'

  // --- Element Selections ---
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarTitle = document.getElementById('sidebar-title');
  const profileName = document.getElementById('profile-name');
  
  const navItems = document.querySelectorAll('.nav-item');
  const navGroupToggles = document.querySelectorAll('[data-group-id]');

  const notificationsContainer = document.getElementById('notifications-container');
  const notificationsButton = document.getElementById('notifications-button');
  const notificationsMenu = document.getElementById('notifications-menu');

  const profileContainer = document.getElementById('profile-container');
  const profileButton = document.getElementById('profile-button');
  const profileMenu = document.getElementById('profile-menu');

  const metricValueElements = document.querySelectorAll('.metric-value');

  // --- State Management ---
  // Initial state is determined by screen size
  let isSidebarCollapsed = window.innerWidth < DESKTOP_BREAKPOINT;
  let activeNavId = 'Dashboard';
  const expandedGroups = {
    Users: false,
    Settings: false,
    Reports: false,
    Analytics: false,
  };
  
  // Data attribute to store user's manual toggle intent on desktop
  sidebar.dataset.userCollapsed = isSidebarCollapsed.toString();


  // --- Functions ---
  
  /**
   * Applies the collapsed or expanded state to the sidebar elements.
   * @param {boolean} collapsed - True to collapse, False to expand.
   */
  function applySidebarState(collapsed) {
    isSidebarCollapsed = collapsed;
    
    // Toggle classes on the main sidebar element
    sidebar.classList.toggle('sidebar-expanded', !collapsed);
    sidebar.classList.toggle('sidebar-collapsed', collapsed);

    // Update the toggle button icon
    const icon = collapsed ? 'menu' : 'x';
    sidebarToggle.innerHTML = `<i data-lucide="${icon}"></i>`;
    lucide.createIcons(); 

    // Update accessibility and visibility of non-icon elements
    sidebarToggle.setAttribute('aria-label', collapsed ? 'Open sidebar' : 'Close sidebar');
    sidebarTitle.style.opacity = '1';
    
    if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        profileName.style.display = collapsed ? 'none' : 'inline';
    } else {
        profileName.style.display = 'inline'; // Always show name when sidebar is open on mobile
    }
    
    // Close any open submenus when collapsing the sidebar
    if (collapsed) {
        Object.keys(expandedGroups).forEach(group => {
            if (expandedGroups[group]) {
                const groupButton = document.querySelector(`[data-group-id="${group}"]`);
                const submenu = document.getElementById(`${group}-submenu`);
                if (groupButton && submenu) {
                    groupButton.setAttribute('aria-expanded', 'false');
                    submenu.classList.remove('submenu-expanded');
                    submenu.classList.add('submenu-collapsed');
                    expandedGroups[group] = false;
                }
            }
        });
    }
  }

  /**
   * Toggles the sidebar's state and records user intent on desktop.
   */
  function toggleSidebarWithUserIntent() {
      const newState = !isSidebarCollapsed;
      applySidebarState(newState);
      
      // Store user intent only when on desktop
      if (window.innerWidth >= DESKTOP_BREAKPOINT) {
        sidebar.dataset.userCollapsed = newState.toString();
      }
  }

  /**
   * Handles screen resize to manage responsive sidebar state.
   */
  let resizeTimeout;
  function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const isMobile = window.innerWidth < DESKTOP_BREAKPOINT;
        const userCollapsed = sidebar.dataset.userCollapsed === 'true';

        if (isMobile) {
            // Mobile: Always force collapsed/hidden state
            applySidebarState(true);
        } else {
            // Desktop: Restore expanded state unless user had manually collapsed it
            applySidebarState(userCollapsed);
        }
    }, 100); // Debounce resize for performance
  }
  
  /**
   * Sets the active navigation item.
   */
  function setActiveNav(navId) {
    activeNavId = navId;
    
    navItems.forEach(item => item.classList.remove('nav-item-active'));
    
    const newActiveItem = document.querySelector(`[data-nav-id="${navId}"]`);
    if (newActiveItem) {
        newActiveItem.classList.add('nav-item-active');
        
        const parentGroup = newActiveItem.closest('.nav-group');
        if (parentGroup) {
            parentGroup.querySelector('[data-group-id]').classList.add('nav-item-active');
        }
    }
    
    // Auto-close sidebar on mobile after selection
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
        applySidebarState(true);
    }
  }

  /**
   * Toggles a navigation group's submenu.
   */
  function toggleGroup(groupId) {
    // Prevent toggling groups if sidebar is collapsed on desktop
    if (isSidebarCollapsed && window.innerWidth >= DESKTOP_BREAKPOINT) return; 

    expandedGroups[groupId] = !expandedGroups[groupId];
    const isExpanded = expandedGroups[groupId];

    const groupButton = document.querySelector(`[data-group-id="${groupId}"]`);
    const submenu = document.getElementById(`${groupId}-submenu`);

    groupButton.setAttribute('aria-expanded', isExpanded);
    submenu.classList.toggle('submenu-expanded', isExpanded);
    submenu.classList.toggle('submenu-collapsed', !isExpanded);
  }

  /**
   * Animates a number counting up from 0 to a target value.
   */
  function countUp(el, duration = 1500) {
    const endValue = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(endValue)) return;
    
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentValue = Math.floor(progress * endValue);
      
      el.textContent = currentValue.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(animation);
      } else {
        el.textContent = endValue.toLocaleString(); // Ensure final value is accurate
      }
    }
    requestAnimationFrame(animation);
  }


  // --- Event Listeners ---

  // Sidebar toggle
  sidebarToggle.addEventListener('click', toggleSidebarWithUserIntent);

  // Responsive logic on resize
  window.addEventListener('resize', handleResize);

  // Navigation group toggles and items
  navGroupToggles.forEach(button => {
    button.addEventListener('click', () => {
      const groupId = button.getAttribute('data-group-id');
      toggleGroup(groupId);
    });
  });

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.currentTarget.hasAttribute('data-group-id')) return;
      
      const navId = item.getAttribute('data-nav-id');
      if (navId) {
        setActiveNav(navId);
      }
    });
  });

  // Notifications and Profile dropdown toggles
  notificationsButton.addEventListener('click', () => {
    const isExpanded = notificationsMenu.style.display === 'block';
    notificationsMenu.style.display = isExpanded ? 'none' : 'block';
    notificationsButton.setAttribute('aria-expanded', !isExpanded);
  });

  profileButton.addEventListener('click', () => {
    const isExpanded = profileMenu.style.display === 'block';
    profileMenu.style.display = isExpanded ? 'none' : 'block';
    profileButton.setAttribute('aria-expanded', !isExpanded);
  });

  // Close dropdowns and sidebar on outside click
  document.addEventListener('mousedown', (event) => {
    if (!notificationsContainer.contains(event.target)) {
      notificationsMenu.style.display = 'none';
      notificationsButton.setAttribute('aria-expanded', 'false');
    }
    if (!profileContainer.contains(event.target)) {
      profileMenu.style.display = 'none';
      profileButton.setAttribute('aria-expanded', 'false');
    }
    
    // Auto-close sidebar on mobile if it's open and user clicks outside
    const isMobile = window.innerWidth < DESKTOP_BREAKPOINT;
    if (isMobile && !isSidebarCollapsed && !sidebar.contains(event.target)) {
        // Check if the click was on the toggle button itself to prevent immediate re-closing
        if (!sidebarToggle.contains(event.target)) {
            applySidebarState(true);
        }
    }
  });


  // --- Initializations ---

  // Initial setup of the sidebar state
  handleResize();
  
  // Trigger the count-up animation for all metric cards
  metricValueElements.forEach(el => countUp(el));

  // Set the initial active navigation item
  setActiveNav(activeNavId);
  
  // Initial render of Lucide icons
  lucide.createIcons();
});