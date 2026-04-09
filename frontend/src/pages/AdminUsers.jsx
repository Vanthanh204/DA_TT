import { useEffect, useState } from "react";
import API from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách người dùng:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const res = await API.patch(`/users/${id}/status`);
      setUsers(users.map(u => u._id === id ? { ...u, isLocked: res.data.isLocked } : u));
      alert(res.data.message);
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert("Lỗi khi cập nhật trạng thái!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        await API.delete(`/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
        alert("Xóa thành công!");
      } catch (err) {
        console.error("Lỗi xóa người dùng:", err);
        alert("Lỗi khi xóa!");
      }
    }
  };

  const handleUpdateLevel = (id, delta) => {
    setUsers(users.map(u => {
      if (u._id === id) {
        return { ...u, level: Math.max(0, (u.level || 0) + delta), isChanged: true };
      }
      return u;
    }));
  };

  const handleToggleRole = (id) => {
    setUsers(users.map(u => {
      if (u._id === id) {
        return { ...u, role: u.role === "admin" ? "user" : "admin", isChanged: true };
      }
      return u;
    }));
  };

  const handleSaveUser = async (user) => {
    try {
      await API.put(`/users/${user._id}`, { 
        level: user.level, 
        role: user.role 
      });
      setUsers(users.map(u => u._id === user._id ? { ...u, isChanged: false } : u));
      alert(`Đã lưu thay đổi cho ${user.username}!`);
    } catch (err) {
      alert("Lỗi khi lưu thay đổi!");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Quản lý người dùng</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", background: "#fff", borderRadius: "8px", overflow: "hidden" }}>
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Người dùng</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Email</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Vai trò</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Level</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Số chương đã đọc</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Trạng thái</th>
            <th style={{ padding: "12px", border: "1px solid #ddd" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="" style={{ width: "30px", height: "30px", borderRadius: "50%" }} />
                  {user.username}
                </div>
              </td>
              <td style={{ padding: "12px", border: "1px solid #ddd" }}>{user.email}</td>
              <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                <button 
                  onClick={() => handleToggleRole(user._id)}
                  style={{ padding: "4px 8px", background: user.role === "admin" ? "#9b59b6" : "#bdc3c7", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}
                >
                  {user.role.toUpperCase()}
                </button>
              </td>
              <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                  <button onClick={() => handleUpdateLevel(user._id, -1)} style={{ width: "25px", height: "25px", borderRadius: "50%", border: "1px solid #ddd", cursor: "pointer" }}>-</button>
                  <span style={{ fontWeight: "bold", color: "#e67e22" }}>{user.level || 0}</span>
                  <button onClick={() => handleUpdateLevel(user._id, 1)} style={{ width: "25px", height: "25px", borderRadius: "50%", border: "1px solid #ddd", cursor: "pointer" }}>+</button>
                </div>
              </td>
              <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>{user.readCount || 0}</td>
              <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                <span style={{ color: user.isLocked ? "red" : "green", fontWeight: "bold" }}>
                  {user.isLocked ? "Bị khóa" : "Hoạt động"}
                </span>
              </td>
              <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                  <button 
                    onClick={() => handleSaveUser(user)}
                    disabled={!user.isChanged}
                    style={{ padding: "5px 10px", backgroundColor: user.isChanged ? "#2ecc71" : "#bdc3c7", color: "#fff", border: "none", borderRadius: "3px", cursor: user.isChanged ? "pointer" : "default" }}
                  >
                    Lưu
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(user._id)}
                    style={{ padding: "5px 10px", backgroundColor: user.isLocked ? "#3498db" : "#f39c12", color: "#fff", border: "none", borderRadius: "3px", cursor: "pointer" }}
                  >
                    {user.isLocked ? "Mở" : "Khóa"}
                  </button>
                  <button 
                    onClick={() => handleDelete(user._id)}
                    style={{ color: "#fff", backgroundColor: "#e74c3c", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;