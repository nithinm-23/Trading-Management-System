import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
} from "react-bootstrap";
import "../styles/Profile.css";
import axios from "axios";
import Funds from "../pages/Funds";
import { Alert } from "react-bootstrap";

const Profile = ({ user }) => {
  const [userData, setUserDetails] = useState({
    name: "", // Will be derived from email
    panNumber: "", // Match backend field
    dob: "", // Match backend field (date of birth)
    gender: "", // Match backend field
    mobileNumber: "",
    email: "",
    balance: 0, // Add balance since it's in the response
    provider: "local",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [activeSection, setActiveSection] = useState("basicDetails");
  const [loading, setLoading] = useState(true);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const userId = JSON.parse(localStorage.getItem("user"))?.id;
      if (!userId) return;

      const response = await axios.get(
        `http://localhost:8080/api/users/${userId}`
      );

      console.log("User data from backend:", response.data);

      // Handle name with proper fallback logic
      const determineName = () => {
        // If name exists and isn't empty, use it
        if (response.data.name && response.data.name.trim() !== "") {
          return response.data.name;
        }

        // For Google users, try to get name from email if no name exists
        if (response.data.provider === "google" && response.data.email) {
          return response.data.email.split("@")[0];
        }

        // Default fallback
        return "";
      };

      const userData = {
        id: response.data.id,
        name: determineName(),
        panNumber: response.data.panNumber || "",
        dob: response.data.dob || "",
        gender: response.data.gender || "",
        mobileNumber: response.data.mobileNumber || "",
        email: response.data.email || "",
        balance: response.data.balance || 0,
        provider: response.data.provider || "local",
        profileCompleted: response.data.profileCompleted || false,
      };

      setUserDetails(userData);
      localStorage.setItem("userData", JSON.stringify(userData));
    } catch (error) {
      console.error("Error fetching user details:", error);

      // Fallback to localStorage data if available
      const localData = localStorage.getItem("userData");
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          setUserDetails((prev) => ({
            ...prev,
            ...parsedData,
            // Don't override name if we already have one in state
            name: prev.name || parsedData.name || "",
          }));
        } catch (e) {
          console.error("Error parsing local user data:", e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails(); // Fetch user details on page load
  }, []);

  const handleChangePassword = async (e) => {
    const userId = JSON.parse(localStorage.getItem("userData"))?.id;

    e.preventDefault();
    setMessage("");

    // Get values from form inputs
    const oldPassword = e.target[0].value;
    const newPassword = e.target[1].value;
    const confirmNewPassword = e.target[2].value;

    // Common validations for all users
    if (!newPassword || !confirmNewPassword) {
      setMessage("New password fields are required.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    try {
      // Different endpoint and payload based on user type
      let endpoint, payload;

      if (userData.provider === "google") {
        // For Google users, we set password without verifying old password
        endpoint = `http://localhost:8080/api/users/${userId}/set-password`;
        payload = { newPassword };
      } else {
        // For regular users, verify old password
        if (!oldPassword) {
          setMessage("Current password is required.");
          return;
        }
        endpoint = `http://localhost:8080/api/users/${userId}/changePassword`;
        payload = { oldPassword, newPassword };
      }

      console.log("Sending request to backend...");
      const response = await axios.put(endpoint, payload);

      console.log("Response received:", response.data);
      setMessage(response.data.message || "Password updated successfully!");

      // Clear form fields on success
      if (response.status === 200) {
        e.target.reset();
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setMessage(
        error.response?.data?.message ||
          error.response?.data ||
          "Failed to update password. Please try again."
      );
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Submitting with these details:", userData);
    const userDataFromState = { ...userData }; // get from current form inputs
    const userId = userDataFromState.id;

    if (!userId) {
      console.error("No user ID found in state");
      alert("User session expired. Please log in again.");
      return;
    }

    try {
      // Determine the correct endpoint based on auth provider
      const endpoint =
        userData.provider === "google"
          ? `http://localhost:8080/api/users/complete-profile`
          : `http://localhost:8080/api/users/${userId}`;

      const response =
        userData.provider === "google"
          ? await axios.post(endpoint, userDataFromState)
          : await axios.put(endpoint, userDataFromState);

      setUserDetails((prev) => ({
        ...prev,
        ...response.data, // This ensures all fields including name are properly updated
        profileCompleted:
          userData.provider === "google"
            ? true
            : response.data.profileCompleted,
      }));

      localStorage.setItem(
        "userData",
        JSON.stringify({
          ...response.data,
          profileCompleted:
            userData.provider === "google"
              ? true
              : response.data.profileCompleted,
        })
      );

      // Create updated user object with guaranteed profileCompleted status
      const updatedUser = {
        ...response.data,
        // Force true for Google users after submission, maintain existing for others
        profileCompleted:
          userData.provider === "google"
            ? true
            : response.data.profileCompleted,
      };

      // Update both state and local storage
      // setUserDetails(updatedUser);
      // localStorage.setItem("userData", JSON.stringify(updatedUser));

      // Show appropriate success message
      alert(
        userData.provider === "google"
          ? "Profile completed successfully!"
          : "Profile updated successfully!"
      );

      // Refresh data
      fetchUserDetails();
    } catch (error) {
      // Enhanced error handling
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Update failed. Please try again.";

      console.error("Update failed:", {
        error: error.message,
        response: error.response?.data,
      });

      alert(`Error: ${errorMessage}`);
    }
  };

  // Render different sections based on activeSection
  const renderSection = () => {
    console.log("Active Section:", activeSection);
    switch (activeSection) {
      case "basicDetails":
        return renderBasicDetailsForm();
      case "changePassword":
        return renderChangePasswordForm();
      case "updateProfile":
        return renderUpdateProfileForm();
      case "funds":
        return <Funds />;
      default:
        return renderBasicDetailsForm();
    }
  };

  // Render the basic details form
  const renderBasicDetailsForm = () => {
    return (
      <Card className="p-4 h-100" style={{ width: "1100px", height: "70%" }}>
        <h3 className="mb-4">Basic Details</h3>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>NAME</Form.Label>
                <p className="immutable-text">{userData.name}</p>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>PAN</Form.Label>
                <p className="immutable-text">{userData.panNumber}</p>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>DATE OF BIRTH (YYYY/MM/DD)</Form.Label>
                <p className="immutable-text">{userData.dob}</p>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>GENDER</Form.Label>
                <p className="immutable-text">{userData.gender}</p>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>MOBILE NUMBER</Form.Label>
                <p className="immutable-text">{userData.mobileNumber}</p>
                {/* <div className="d-flex justify-content-end mt-2">
                  <Button variant="outline-primary" size="sm">EDIT</Button>
                </div> */}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>EMAIL</Form.Label>
                <p className="immutable-text">{userData.email}</p>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Card>
    );
  };

  // Render the change password form
  const renderChangePasswordForm = () => {
    const isGoogleUser = userData.provider === "google";
    const hasPassword = userData.password !== null && userData.password !== "";

    return (
      <Card className="p-4 h-100" style={{ width: "1100px" }}>
        <h3 className="mb-4">
          {isGoogleUser && !hasPassword ? "Set Password" : "Change Password"}
        </h3>
        <Form onSubmit={handleChangePassword}>
          {(!isGoogleUser || hasPassword) && (
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                required={!isGoogleUser}
                disabled={isGoogleUser && !hasPassword}
              />
            </Form.Group>
          )}
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control type="password" required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control type="password" required />
          </Form.Group>
          <div className="d-flex justify-content-end mt-4">
            <Button variant="primary" type="submit">
              {isGoogleUser && !hasPassword
                ? "Set Password"
                : "Update Password"}
            </Button>
          </div>
        </Form>
        {message && (
          <Alert
            variant={message.includes("success") ? "success" : "danger"}
            className="mt-3"
          >
            {message}
          </Alert>
        )}
      </Card>
    );
  };

  // Render the update profile form
  const renderUpdateProfileForm = () => {
    const isGoogleUser = userData.provider === "google";
    const showCompletionAlert = isGoogleUser && !userData.profileCompleted;

    return (
      <Card className="p-4 h-100" style={{ width: "1100px" }}>
        <h3 className="mb-4">Update Profile</h3>
        {showCompletionAlert && (
          <Alert variant="info" className="mb-4">
            Please complete your profile details
          </Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  required
                  readOnly={isGoogleUser}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  name="mobileNumber"
                  value={userData.mobileNumber}
                  onChange={handleInputChange}
                  required={isGoogleUser}
                />
              </Form.Group>
            </Col>
            {/* {isGoogleUser && ( */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>PAN Number</Form.Label>
                <Form.Control
                  type="text"
                  name="panNumber"
                  value={userData.panNumber}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            {/* )} */}
          </Row>
          {/* Add Date of Birth and Gender fields */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  name="dob"
                  value={userData.dob}
                  onChange={handleInputChange}
                  required={isGoogleUser}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  name="gender"
                  value={userData.gender}
                  onChange={handleInputChange}
                  required={isGoogleUser}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  {/* <option value="Other">Other</option> */}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end mt-4">
            <Button variant="primary" type="submit">
              {isGoogleUser && !userData?.profileCompleted
                ? "Complete Profile"
                : "Update Profile"}
            </Button>
          </div>
        </Form>
      </Card>
    );
  };

  return (
    <>
      {/* <Navbar /> */}
      <Container
        fluid
        className="profile-container p-0 vh-100 d-flex flex-column"
      >
        <Row className="g-0 h-100 flex-grow-1">
          {/* Sidebar */}
          <Col md={3} className="sidebar h-100">
            <Card className="text-center mb-4 profile-info-card">
              <Card.Body>
                <div className="profile-image-container mb-3">
                  <div className="profile-circle">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="profile-image"
                      />
                    ) : (
                      <div className="profile-initial">
                        {userData?.name?.charAt(0)?.toUpperCase() || "N"}
                      </div>
                    )}
                  </div>
                </div>
                <h4>{userData.name}</h4>
              </Card.Body>
            </Card>

            <ListGroup className="menu-list">
              <ListGroup.Item
                action
                active={activeSection === "basicDetails"}
                onClick={() => setActiveSection("basicDetails")}
                className="d-flex justify-content-between align-items-center list-item"
              >
                Basic Details
              </ListGroup.Item>
              <ListGroup.Item
                action
                active={activeSection === "changePassword"}
                onClick={() => setActiveSection("changePassword")}
                className="d-flex justify-content-between align-items-center list-item"
              >
                Change Password
              </ListGroup.Item>
              <ListGroup.Item
                action
                active={activeSection === "updateProfile"}
                onClick={() => setActiveSection("updateProfile")}
                className="d-flex justify-content-between align-items-center list-item"
              >
                Update Profile
              </ListGroup.Item>

              <ListGroup.Item
                action
                active={activeSection === "funds"}
                onClick={() => setActiveSection("funds")}
                className="d-flex justify-content-between align-items-center list-item"
              >
                Funds
              </ListGroup.Item>
            </ListGroup>
          </Col>

          {/* Main Content Area */}
          <Col md={9} className="content-area h-100 w-90">
            {renderSection()}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Profile;
