let currentUser = null;
let authToken = localStorage.getItem("access_token") || null;

// Initialize App on DOM Load
document.addEventListener("DOMContentLoaded", () => {
    if (authToken) {
        fetchCurrentUser();
    } else {
        showAuthView();
    }
});

function switchAuthTab(tab) {
    const tabLogin = document.getElementById("tabLogin");
    const tabRegister = document.getElementById("tabRegister");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (tab === 'login') {
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
    } else {
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
        registerForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
    }
}

async function quickLogin(email, password) {
    document.getElementById("loginEmail").value = email;
    document.getElementById("loginPassword").value = password;
    await handleLogin(new Event("submit"));
}

async function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            alert("Login failed: " + (data.detail || "Invalid credentials"));
            return;
        }

        authToken = data.access_token;
        currentUser = data.user;
        localStorage.setItem("access_token", authToken);
        showDashboardView();
    } catch (err) {
        alert("Error connecting to server");
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const role = document.getElementById("regRole").value;
    const password = document.getElementById("regPassword").value;

    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, role, password })
        });
        const data = await res.json();

        if (!res.ok) {
            alert("Registration failed: " + (data.detail || "Could not register"));
            return;
        }

        alert("Account created successfully! Please sign in.");
        switchAuthTab('login');
        document.getElementById("loginEmail").value = email;
    } catch (err) {
        alert("Error connecting to server");
    }
}

async function fetchCurrentUser() {
    try {
        const res = await fetch("/api/auth/me", {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        if (!res.ok) {
            logout();
            return;
        }
        currentUser = await res.json();
        showDashboardView();
    } catch (err) {
        showAuthView();
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem("access_token");
    showAuthView();
}

function showAuthView() {
    document.getElementById("authSection").classList.remove("hidden");
    document.getElementById("dashboardSection").classList.add("hidden");
    document.getElementById("userProfile").classList.add("hidden");
    document.getElementById("demoAuthBar").classList.remove("hidden");
}

function showDashboardView() {
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("dashboardSection").classList.remove("hidden");
    document.getElementById("userProfile").classList.remove("hidden");
    document.getElementById("demoAuthBar").classList.add("hidden");

    // Render User Header Profile
    document.getElementById("userName").innerText = currentUser.name;
    document.getElementById("userAvatar").innerText = currentUser.name.charAt(0).toUpperCase();
    const roleBadge = document.getElementById("userRoleBadge");
    roleBadge.innerText = currentUser.role;

    const isSupervisor = currentUser.role.toLowerCase() === "supervisor";
    document.getElementById("roleIndicator").innerText = isSupervisor ? "Managing All Ground Tasks" : "My Assigned Operational Tasks";
    
    if (isSupervisor) {
        document.getElementById("btnOpenCreateTask").classList.remove("hidden");
    } else {
        document.getElementById("btnOpenCreateTask").classList.add("hidden");
    }

    loadDashboard();
}

async function loadDashboard() {
    fetchStats();
    fetchTasks();
}

async function fetchStats() {
    try {
        const res = await fetch("/api/tasks/stats/summary", {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        const json = await res.json();
        if (json.success) {
            document.getElementById("statTotal").innerText = json.data.total;
            document.getElementById("statPending").innerText = json.data.pending;
            document.getElementById("statInProgress").innerText = json.data.in_progress;
            document.getElementById("statCompleted").innerText = json.data.completed;
        }
    } catch (err) {
        console.error("Failed to load stats", err);
    }
}

async function fetchTasks() {
    const tasksList = document.getElementById("tasksList");
    tasksList.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 2rem; color: #9CA3AF;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:0.5rem">Loading tasks...</p></div>`;

    try {
        const res = await fetch("/api/tasks", {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        const tasks = await res.json();

        if (tasks.length === 0) {
            tasksList.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 3rem; background: rgba(18,26,44,0.5); border-radius: 16px; border: 1px dashed var(--border-color); color: #9CA3AF;">
                <i class="fa-solid fa-clipboard-list fa-3x" style="margin-bottom:1rem; opacity:0.5;"></i>
                <p>No tasks found.</p>
            </div>`;
            return;
        }

        const isSupervisor = currentUser.role.toLowerCase() === "supervisor";
        let staffList = [];
        if (isSupervisor) {
            const staffRes = await fetch("/api/users/staff", { headers: { "Authorization": `Bearer ${authToken}` } });
            if (staffRes.ok) staffList = await staffRes.json();
        }

        tasksList.innerHTML = tasks.map(task => renderTaskCard(task, isSupervisor, staffList)).join("");
    } catch (err) {
        tasksList.innerHTML = `<div style="color:var(--rose)">Failed to load tasks.</div>`;
    }
}

function renderTaskCard(task, isSupervisor, staffList) {
    const statusClass = task.status === "Pending" ? "badge-pending" : task.status === "In Progress" ? "badge-progress" : "badge-completed";
    const assignedStaff = task.assignments && task.assignments.length > 0 ? task.assignments[0].staff : null;
    const assignedName = assignedStaff ? assignedStaff.name : "Unassigned";

    let statusActionBtn = "";
    if (task.status === "Pending") {
        statusActionBtn = `<button class="btn btn-sm btn-primary" onclick="updateStatus(${task.id}, 'In Progress')"><i class="fa-solid fa-play"></i> Start Task</button>`;
    } else if (task.status === "In Progress") {
        statusActionBtn = `<button class="btn btn-sm btn-primary" style="background:var(--emerald)" onclick="updateStatus(${task.id}, 'Completed')"><i class="fa-solid fa-check"></i> Complete Task</button>`;
    } else {
        statusActionBtn = `<span style="font-size:0.75rem; color:var(--emerald); font-weight:700;"><i class="fa-solid fa-circle-check"></i> Task Finished</span>`;
    }

    let reassignControl = "";
    if (isSupervisor && staffList.length > 0) {
        reassignControl = `
            <div style="margin-top: 0.5rem;">
                <label style="font-size:0.7rem; color:var(--text-secondary)">Reassign Staff:</label>
                <select style="padding:0.3rem 0.5rem; font-size:0.75rem; margin-top:0.2rem" onchange="assignTaskStaff(${task.id}, this.value)">
                    <option value="">-- Select Staff --</option>
                    ${staffList.map(s => `<option value="${s.id}" ${assignedStaff && assignedStaff.id === s.id ? 'selected' : ''}>${s.name}</option>`).join("")}
                </select>
            </div>
        `;
    }

    return `
        <div class="task-card">
            <div>
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <span class="badge ${statusClass}">${task.status}</span>
                </div>
                <p class="task-desc">${task.description || "No description provided."}</p>
            </div>

            <div>
                <div class="task-meta">
                    <div><i class="fa-solid fa-location-dot"></i> Zone: <strong>${task.zone ? task.zone.zone_name : "General Zone"}</strong></div>
                    <div><i class="fa-solid fa-user-check"></i> Assigned Staff: <strong>${assignedName}</strong></div>
                    <div><i class="fa-solid fa-flag"></i> Priority: <strong>${task.priority}</strong></div>
                </div>

                ${reassignControl}

                <div class="task-actions" style="margin-top: 0.75rem;">
                    ${statusActionBtn}
                </div>
            </div>
        </div>
    `;
}

async function updateStatus(taskId, newStatus) {
    try {
        const res = await fetch(`/api/tasks/${taskId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) {
            const data = await res.json();
            alert("Could not update status: " + (data.detail || "Error"));
            return;
        }
        loadDashboard();
    } catch (err) {
        alert("Error updating status");
    }
}

async function assignTaskStaff(taskId, staffId) {
    if (!staffId) return;
    try {
        const res = await fetch(`/api/tasks/${taskId}/assign?staff_id=${staffId}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        if (!res.ok) {
            alert("Failed to assign staff");
            return;
        }
        loadDashboard();
    } catch (err) {
        alert("Error assigning staff");
    }
}

async function openCreateTaskModal() {
    document.getElementById("taskModal").classList.remove("hidden");
    
    // Load Zones
    const zoneSelect = document.getElementById("taskZone");
    const zoneRes = await fetch("/api/zones", { headers: { "Authorization": `Bearer ${authToken}` } });
    if (zoneRes.ok) {
        const zones = await zoneRes.json();
        zoneSelect.innerHTML = zones.map(z => `<option value="${z.id}">${z.zone_name} (${z.terminal})</option>`).join("");
    }

    // Load Staff Dropdown
    const staffSelect = document.getElementById("taskAssignStaff");
    const staffRes = await fetch("/api/users/staff", { headers: { "Authorization": `Bearer ${authToken}` } });
    if (staffRes.ok) {
        const staff = await staffRes.json();
        staffSelect.innerHTML = `<option value="">-- Unassigned --</option>` + staff.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
    }
}

function closeCreateTaskModal() {
    document.getElementById("taskModal").classList.add("hidden");
}

async function handleCreateTask(e) {
    e.preventDefault();
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDesc").value;
    const zone_id = parseInt(document.getElementById("taskZone").value);
    const priority = document.getElementById("taskPriority").value;
    const assigned_staff_id = document.getElementById("taskAssignStaff").value ? parseInt(document.getElementById("taskAssignStaff").value) : null;

    try {
        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ title, description, zone_id, priority, assigned_staff_id })
        });

        if (!res.ok) {
            const data = await res.json();
            alert("Failed to create task: " + (data.detail || "Error"));
            return;
        }

        closeCreateTaskModal();
        loadDashboard();
    } catch (err) {
        alert("Error creating task");
    }
}
