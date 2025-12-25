import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/Notes.css";

const API_URL = "http://localhost:3000/api/notes";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({
    note_id: null,
    user_id: null,
    title: "",
    description: "",
    actionDate: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.user_id) {
      setForm((prev) => ({ ...prev, user_id: storedUser.user_id }));
    }
  }, []);

  const fetchNotes = async () => {
    if (!form.user_id) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/user/${form.user_id}`);
      setNotes(res.data || []);
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.user_id) fetchNotes();
  }, [form.user_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      alert(" Please fill in both title and description!");
      return;
    }

    const noteData = {
      user_id: form.user_id,
      title: form.title.trim(),
      description: form.description.trim(),
      actionDate: form.actionDate || new Date().toISOString().split("T")[0],
    };

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/${form.note_id}`, noteData);
        alert(" Note updated successfully!");
      } else {
        await axios.post(API_URL, noteData);
        alert(" Note added successfully!");
      }

      resetForm();
      fetchNotes();
    } catch (err) {
      console.error("Save note error:", err);
      alert(" Failed to save note. Please try again.");
    }
  };

  const handleEdit = (note) => {
    setForm({
      note_id: note.note_id,
      user_id: form.user_id,
      title: note.title,
      description: note.description,
      actionDate: note.actionDate ? note.actionDate.split("T")[0] : "",
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (note_id) => {
    if (!window.confirm("🗑️ Are you sure you want to delete this note?")) return;

    try {
      await axios.delete(`${API_URL}/${note_id}`, {
        data: { user_id: form.user_id },
      });
      alert(" Note deleted successfully!");
      fetchNotes();
    } catch (err) {
      console.error("Delete error:", err);
      alert(" Failed to delete note.");
    }
  };

  const resetForm = () => {
    setForm({
      note_id: null,
      user_id: form.user_id,
      title: "",
      description: "",
      actionDate: "",
    });
    setIsEditing(false);
  };

  return (
    <div className="note-container">
      <h2 className="note-header">📝 Notes Management</h2>

      <form className="note-form" onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          placeholder="Enter title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          placeholder="Enter description"
          value={form.description}
          onChange={handleChange}
          required
        ></textarea>

        <label htmlFor="actionDate">Action Date</label>
        <input
          id="actionDate"
          type="date"
          name="actionDate"
          value={form.actionDate}
          onChange={handleChange}
        />

        <div className="note-buttons">
          <button type="submit" className="submit-btn">
            {isEditing ? "Update Note" : "Add Note"}
          </button>
          {isEditing && (
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="notes-list">
        {loading ? (
          <p className="loading-text">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="no-notes">No notes available.</p>
        ) : (
          notes.map((note) => (
            <div key={note.note_id} className="note-card">
              <h3>{note.title}</h3>
              <p>{note.description}</p>
              <p className="note-date">
                📅 <strong>Action Date:</strong>{" "}
                {note.actionDate ? note.actionDate.split("T")[0] : "No date"}
              </p>
              <div className="note-actions">
                <button className="edit-btn" onClick={() => handleEdit(note)}>
                  ✏️ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(note.note_id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notes;
