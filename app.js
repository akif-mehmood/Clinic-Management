const users = [
  { email: "admin@clinic.com", password: "1234", role: "admin" },
  { email: "doctor@clinic.com", password: "1234", role: "doctor" },
  { email: "receptionist@clinic.com", password: "1234", role: "receptionist" },
  { email: "patient@clinic.com", password: "1234", role: "patient" }
];

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const user = users.find(u => u.email === email && u.password === password);

  if(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("error").innerText = "Invalid Credentials";
  }
}

// ---------------- PATIENT SYSTEM ----------------

function getPatients(){
  return JSON.parse(localStorage.getItem("patients")) || [];
}

function savePatients(patients){
  localStorage.setItem("patients", JSON.stringify(patients));
}

function showPatients(){
  const content = document.getElementById("content");

  content.innerHTML = `
    <h3>Patient Management</h3>

    <input id="pname" placeholder="Name">
    <input id="page" placeholder="Age">
    <input id="pgender" placeholder="Gender">
    <input id="pcontact" placeholder="Contact">
    <button onclick="addPatient()">Add Patient</button>

    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Contact</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="patientList"></tbody>
    </table>
  `;

  renderPatients();
}

function addPatient(){
  const name = document.getElementById("pname").value;
  const age = document.getElementById("page").value;
  const gender = document.getElementById("pgender").value;
  const contact = document.getElementById("pcontact").value;

  if(!name || !age || !gender || !contact){
    alert("Please fill all fields");
    return;
  }

  const patients = getPatients();

  patients.push({
    id: Date.now(),
    name,
    age,
    gender,
    contact,
    createdAt: new Date().toLocaleString()
  });

  savePatients(patients);
  renderPatients();

  document.getElementById("pname").value = "";
  document.getElementById("page").value = "";
  document.getElementById("pgender").value = "";
  document.getElementById("pcontact").value = "";
}

function renderPatients(){
  const patients = getPatients();
  const list = document.getElementById("patientList");

  if(!list) return;

  list.innerHTML = "";

  patients.forEach(p => {
    list.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.age}</td>
        <td>${p.gender}</td>
        <td>${p.contact}</td>
        <td>
          <button onclick="deletePatient(${p.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function deletePatient(id){
  let patients = getPatients();
  patients = patients.filter(p => p.id !== id);
  savePatients(patients);
  renderPatients();
}

// ---------------- APPOINTMENT SYSTEM ----------------

function getAppointments(){
  return JSON.parse(localStorage.getItem("appointments")) || [];
}

function saveAppointments(data){
  localStorage.setItem("appointments", JSON.stringify(data));
}

function showAppointments(){
  const content = document.getElementById("content");
  const patients = getPatients();

  let patientOptions = patients.map(p => 
    `<option value="${p.id}">${p.name}</option>`
  ).join("");

  content.innerHTML = `
    <h3>Appointment Management</h3>

    <select id="apatient">
      <option value="">Select Patient</option>
      ${patientOptions}
    </select>

    <input type="datetime-local" id="adate">
    <select id="astatus">
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="completed">Completed</option>
    </select>

    <button onclick="addAppointment()">Book Appointment</button>

    <table class="table">
      <thead>
        <tr>
          <th>Patient</th>
          <th>Date</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="appointmentList"></tbody>
    </table>
  `;

  renderAppointments();
}

function addAppointment(){
  const patientId = document.getElementById("apatient").value;
  const date = document.getElementById("adate").value;
  const status = document.getElementById("astatus").value;

  if(!patientId || !date){
    alert("Fill all fields");
    return;
  }

  const appointments = getAppointments();

  appointments.push({
    id: Date.now(),
    patientId,
    date,
    status,
    createdAt: new Date().toLocaleString()
  });

  saveAppointments(appointments);
  renderAppointments();
}

function renderAppointments(){
  const appointments = getAppointments();
  const patients = getPatients();
  const list = document.getElementById("appointmentList");

  if(!list) return;

  list.innerHTML = "";

  appointments.forEach(a => {
    const patient = patients.find(p => p.id == a.patientId);

    list.innerHTML += `
      <tr>
        <td>${patient ? patient.name : "Unknown"}</td>
        <td>${a.date}</td>
        <td>${a.status}</td>
        <td>
          <button onclick="deleteAppointment(${a.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function deleteAppointment(id){
  let appointments = getAppointments();
  appointments = appointments.filter(a => a.id !== id);
  saveAppointments(appointments);
  renderAppointments();
}

// ---------------- PRESCRIPTION SYSTEM ----------------

function getPrescriptions(){
  return JSON.parse(localStorage.getItem("prescriptions")) || [];
}

function savePrescriptions(data){
  localStorage.setItem("prescriptions", JSON.stringify(data));
}

function showPrescriptions(){
  const content = document.getElementById("content");
  const patients = getPatients();

  let patientOptions = patients.map(p => 
    `<option value="${p.id}">${p.name}</option>`
  ).join("");

  content.innerHTML = `
    <h3>Prescription System</h3>

    <select id="ppatient">
      <option value="">Select Patient</option>
      ${patientOptions}
    </select>

    <div id="medicines"></div>

    <button onclick="addMedicineField()">Add Medicine</button>
    <textarea id="pinstructions" placeholder="Notes / Instructions"></textarea>
    <button onclick="savePrescription()">Save Prescription</button>

    <h4>Saved Prescriptions</h4>
    <table class="table">
      <thead>
        <tr>
          <th>Patient</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="prescriptionList"></tbody>
    </table>
  `;

  addMedicineField();
  renderPrescriptions();
}

function addMedicineField(){
  const container = document.getElementById("medicines");

  container.innerHTML += `
    <input class="medname" placeholder="Medicine Name">
    <input class="meddose" placeholder="Dosage">
  `;
}

function savePrescription(){
  const patientId = document.getElementById("ppatient").value;
  const instructions = document.getElementById("pinstructions").value;

  if(!patientId){
    alert("Select patient");
    return;
  }

  const medNames = document.querySelectorAll(".medname");
  const medDoses = document.querySelectorAll(".meddose");

  let medicines = [];

  for(let i=0; i<medNames.length; i++){
    if(medNames[i].value){
      medicines.push({
        name: medNames[i].value,
        dose: medDoses[i].value
      });
    }
  }

  const prescriptions = getPrescriptions();

  prescriptions.push({
    id: Date.now(),
    patientId,
    medicines,
    instructions,
    createdAt: new Date().toLocaleString()
  });

  savePrescriptions(prescriptions);
  renderPrescriptions();
}

function renderPrescriptions(){
  const prescriptions = getPrescriptions();
  const patients = getPatients();
  const list = document.getElementById("prescriptionList");

  if(!list) return;

  list.innerHTML = "";

  prescriptions.forEach(p => {
    const patient = patients.find(pt => pt.id == p.patientId);

    list.innerHTML += `
      <tr>
        <td>${patient ? patient.name : "Unknown"}</td>
        <td>${p.createdAt}</td>
        <td>
          <button onclick="generatePDF(${p.id})">Download PDF</button>
        </td>
      </tr>
    `;
  });
}

function generatePDF(id){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const prescriptions = getPrescriptions();
  const patients = getPatients();

  const p = prescriptions.find(pr => pr.id === id);
  const patient = patients.find(pt => pt.id == p.patientId);

  doc.text("Clinic Prescription", 20, 20);
  doc.text("Patient: " + (patient ? patient.name : ""), 20, 30);
  doc.text("Date: " + p.createdAt, 20, 40);

  let y = 50;

  p.medicines.forEach(m => {
    doc.text(m.name + " - " + m.dose, 20, y);
    y += 10;
  });

  doc.text("Instructions:", 20, y + 10);
  doc.text(p.instructions, 20, y + 20);

  doc.save("prescription.pdf");
}

// ---------------- MEDICAL TIMELINE ----------------

function showPatientTimeline(){
  const content = document.getElementById("content");
  const patients = getPatients();

  let patientOptions = patients.map(p => 
    `<option value="${p.id}">${p.name}</option>`
  ).join("");

  content.innerHTML = `
    <h3>Medical History Timeline</h3>

    <select id="timelinePatient" onchange="renderTimeline()">
      <option value="">Select Patient</option>
      ${patientOptions}
    </select>

    <div id="timeline"></div>
  `;
}

function renderTimeline(){
  const patientId = document.getElementById("timelinePatient").value;
  if(!patientId) return;

  const appointments = getAppointments().filter(a => a.patientId == patientId);
  const prescriptions = getPrescriptions().filter(p => p.patientId == patientId);

  let events = [];

  appointments.forEach(a => {
    events.push({
      type: "Appointment",
      date: a.createdAt,
      detail: "Status: " + a.status
    });
  });

  prescriptions.forEach(p => {
    events.push({
      type: "Prescription",
      date: p.createdAt,
      detail: "Medicines: " + p.medicines.length
    });
  });

  events.sort((a,b) => new Date(a.date) - new Date(b.date));

  const timelineDiv = document.getElementById("timeline");
  timelineDiv.innerHTML = "";

  events.forEach(e => {
    timelineDiv.innerHTML += `
      <div style="background:white;padding:10px;margin:10px 0;border-radius:6px;">
        <strong>${e.type}</strong><br>
        ${e.detail}<br>
        <small>${e.date}</small>
      </div>
    `;
  });
}
