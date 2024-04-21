import React from "react";
import { useState, useEffect } from "react";
import { Sidebar, SidebarButton, WelcomeMessage } from "../components";
import {
  PurchaseProduct,
  ShippingForm,
  TrackingForm,
  FeedbackForm,
  UpdateInfo,
  LogParcel,
  CustomerProfile,
  EmployeeProfile,
} from "../forms";
import AddOffice from "../forms/AddOffice";
import ManageOffice from "../forms/manageOffice";
import MyActions from "../reports/MyActions";
import OrdersInOffice from "../reports/OrdersInOffice";
import {
  OrderHistory,
  Inventory,
  Reports,
  OrderReport,
  Employees,
  OfficeReport
} from "../reports";
import "../css/Dashboard.css";

const Dashboard = ({ user }) => {
  const userViews = {
    customer: [
      {
        id: "TrackingForm",
        text: "Tracking",
      },
      {
        id: "OrderHistory",
        text: "Order History",
      },
      {
        id: "FeedbackForm",
        text: "Feedback",
      },
      {
        id: "CustomerProfile",
        text: "Profile",
      },
    ],
    mailcourier: [
      {
        id: "TrackingForm",
        text: "Tracking",
      },
      {
        id: "LogParcel",
        text: "Log Parcel",
      },
      {
        id: "MyActions",
        text: "My Actions",
      },
      {
        id: "OrdersInOffice",
        text: "Parcels at Office",
      },
      {
        id: "EmployeeProfile",
        text: "Profile",
      },
    ],
    officeclerk: [
      {
        id: "TrackingForm",
        text: "Tracking",
      },
      {
        id: "ShippingForm",
        text: "Shipping",
      },
      {
        id: "PurchaseProduct",
        text: "Purchase Products",
      },
      {
        id: "MyActions",
        text: "My Actions",
      },
      {
        id: "OrdersInOffice",
        text: "Parcels at Office",
      },
      {
        id: "EmployeeProfile",
        text: "Profile",
      },
    ],
    postmaster: [
      {
        id: "TrackingForm",
        text: "Tracking",
      },
      {
        id: "Employees",
        text: "Manage Employees",
      },
      {
        id: "Inventory",
        text: "Inventory",
      },
      {
        id: "Reports",
        text: "Reports",
      },
      {
        id: "OrdersInOffice",
        text: "Parcels at Office",
      },
      {
        id: "EmployeeProfile",
        text: "Profile",
      },
    ],
    admin: [
      {
        id: "TrackingForm",
        text: "Tracking",
      },
      {
        id: "AddOffice",
        text: "Add a Post Office",
      },
      {
        id: "ManageOffice",
        text: "Manage your Post Offices",
      },
      {
        id: "OfficeReport",
        text: "Office Report",
      }
    ],
  };

  const components = {
    TrackingForm: TrackingForm,
    ShippingForm: ShippingForm,
    FeedbackForm: FeedbackForm,
    OrderHistory: OrderHistory,
    PurchaseProduct: PurchaseProduct,
    Employees: Employees,
    Inventory: Inventory,
    UpdateInfo: UpdateInfo,
    LogParcel: LogParcel,
    Reports: Reports,
    OrderReport: OrderReport,
    CustomerProfile: CustomerProfile,
    EmployeeProfile: EmployeeProfile,
    MyActions: MyActions,
    AddOffice: AddOffice,
    ManageOffice: ManageOffice,
    OrdersInOffice: OrdersInOffice,
    OfficeReport: OfficeReport
  };

  const [currentView, setCurrentView] = useState();
  const [activeComponent, setActiveComponent] = useState("");

  useEffect(() => {
    // Set default view based on user role
    if (user) {
      setCurrentView(<WelcomeMessage role={user} />);
    }
  }, [user]);

  function handleClick(event) {
    const form = event.target.id;
    const MyComponent = components[form];
    setCurrentView(<MyComponent />);

    if (activeComponent.length > 0) {
      // remove active class from component
      document.getElementById(activeComponent).classList.remove("active");
    }

    setActiveComponent(form);
    event.target.classList.add("active");
  }

  function getLinks() {
    if (!user) {
      return <section>404 or something</section>;
    }

    return userViews[user].map((view) => {
      return (
        <SidebarButton
          key={view.id}
          id={view.id}
          text={view.text}
          handleClick={handleClick}
        />
      );
    });
  }

  const userRole = {
    postmaster: "Postmaster",
    mailcourier: "Mail Courier",
    officeclerk: "Office Clerk",
    admin: "Admin"
  };

  const userLinks = getLinks();

  return (
    <main className="Dashboard">
      <Sidebar links={userLinks} />
      {user !== "customer" && (
        <h4 style={{ textAlign: "center" }}>{userRole[user]}</h4>
      )}
      <section>{currentView && currentView}</section>
    </main>
  );
};

export default Dashboard;
