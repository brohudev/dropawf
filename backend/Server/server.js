const http = require("http"); //essetnials
const url = require("url");
const cors = require("cors");
//get the api functions themselves:
const customerApi = require("../api/customerAPI.js");
const postMasterApi = require("../api/postMasterAPI.js");
const mailCarriersApi = require("../api/mailCarrierAPI.js");
const dashboardApi = require("../api/dashboardAPI.js");
const trackPackageApi = require("../api/trackPackageAPI.js");
const userApi = require("../api/userAPI.js");
const officeClerkApi = require("../api/officeClerkAPI.js");
const reportsApi = require("../api/reportsAPI.js");
const adminAPI = require("../api/adminAPI.js");

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Enable CORS using cors middleware
  cors()(req, res, () => {
    const parsedUrl = url.parse(req.url, true); // Parse request URL
    const pathname = parsedUrl.pathname;

    switch (pathname) {
      // Customer API endpoints
      case "/user/validate-login":
        userApi.validateUser(req, res);
        break;
      case "/user/register":
        userApi.register(req, res);
        break;
      case "/user/update-user-details":
        userApi.updateUserDetails(req, res);
        break;
      case "/user/getActions":
        userApi.getActions(req, res);
        break;
      case "/user/check-role":
        userApi.checkRole(req, res);
        break;
      case "/user/get-orders-through-office":
        userApi.getOrdersThroughOffice(req, res);
        break;
      case "/user/edit-shipping-info":
        userApi.editShippingInfo(req, res);
        break;
      case "/user/update-shipping-info":
        userApi.updateShippingInfo(req, res);
        break;

      case "/customer/sent-packages":
        customerApi.getSentPackagesHistory(req, res);
        break;
      case "/customer/reciving-packages":
        customerApi.getRecivingPackages(req, res);
        break;
      case "/customer/post-customer-review":
        customerApi.postCustomerReview(req, res);
        break;
      case "/customer/get-tracking-details":
        customerApi.getTrackingDetails(req, res);
        break;
      case "/customer/get-profile":
        customerApi.getCustomerProfile(req, res);
        break;
      case "/customer/get-payment-profile":
        customerApi.getPaymentProfile(req, res);
        break;
      case "/customer/update-account-details":
        customerApi.updateAccountDetails(req, res);
        break;
      case "/customer/update-shipping-details":
        customerApi.updateShippingDetails(req, res);
        break;
      case "/customer/update-payment-details":
        customerApi.updatePaymentDetails(req, res);
        break;
      case "/customer/notification-number":
        customerApi.getNumNotif(req, res);
        break;
      case "/customer/read-notifications":
        customerApi.readNotif(req, res);
        break;

      //Office Clerk API endpoints
      case "/office-clerk/ship-package":
        officeClerkApi.shipPackage(req, res);
        break;
      case "/office-clerk/post-place-order":
        officeClerkApi.postPlaceOrder(req, res);
        break;
      case "/office-clerk/get-product-list":
        officeClerkApi.getProductList(req, res);
        break;
      case "/office-clerk/get-customer-payment":
        officeClerkApi.getCustomerPayment(req, res);
        break;
      // Post Master API endpoints
      case "/post-master/add-employee": //done
        postMasterApi.addEmployee(req, res);
        break;
      case "/post-master/update-employee": //done
        postMasterApi.updateEmployeeDetails(req, res);
        break;
      case "/post-master/get-product-list": //done
        postMasterApi.getProductList(req, res);
        break;
      case "/post-master/add-inventory": //done
        postMasterApi.addInventory(req, res);
        break;
      case "/post-master/get-inventory": //done
        postMasterApi.getInventory(req, res);
        break;
      case "/post-master/get-notifs":
        postMasterApi.getNumNotif(req, res);
        break;
      case "/post-master/close-notifs":
        postMasterApi.closeNotifs(req, res);
        break;
      case "/post-master/get-profile":
        postMasterApi.getPostmasterProfile(req, res);
        break;
      case "/post-master/get-post-office":
        postMasterApi.getPostmasterOffice(req, res);
        break;
      case "/post-master/update-account-details":
        postMasterApi.updateAccountDetails(req, res);
        break;
      case "/post-master/update-shipping-details":
        postMasterApi.updateShippingDetails(req, res);
        break;
      case "/post-master/get-employee-profile":
        postMasterApi.getEmployeeProfile(req, res);
        break;
      case "/post-master/update-employee-account":
        postMasterApi.updateEmployeeAccountDetails(req, res);
        break;
      case "/post-master/get-employee-post-office":
        postMasterApi.getEmployeePostOffice(req, res);
        break;
      case "/post-master/update-employee-salary":
        postMasterApi.updateEmployeeSalary(req, res);
        break;
      case "/post-master/fire-employee":
        postMasterApi.fireEmployee(req, res);
        break;
      case "/post-master/get-inventory-notifs":
        postMasterApi.getInventoryNotifs(req, res);
        break;
      case "/post-master/close-inventory":
        postMasterApi.closeInventory(req, res);
        break;
      case "/post-master/rehire-employee":
        postMasterApi.rehireEmployee(req, res);
        break;
      case "/post-master/get-employees-under":
        postMasterApi.getEmployeesUnder(req, res);
        break;
      case "/post-master/delete-parcel":
        postMasterApi.deleteParcel(req, res);
        break;

      // Mail Carriers API endpoints
      case "/mail-carriers/post-action": //done
        mailCarriersApi.postCarrierAction(req, res);
        break;
      case "/mail-carriers/update-box-info": //done
        mailCarriersApi.updateBoxInfo(req, res);
        break;
      case "/mail-carriers/get-office-list":
        mailCarriersApi.getOfficeList(req, res);
        break;

      // Dashboard API endpoints
      case "/dashboard/employee-info": //done
        dashboardApi.getEmployeeDashboardInfo(req, res);
        break;
      // Track Package API endpoint
      case "/track-package": //done
        trackPackageApi.handleTrackPackageRequest(req, res);
        break;
      // Reports API endpoints
      case "/report/get-employee-report": //done
        reportsApi.getEmployeeReport(req, res);
        break;
      case "/report/get-order-report": //done
        reportsApi.getOrderReport(req, res);
        break;
      case "/report/get-revenue-report": //done
        reportsApi.getRevenueReport(req, res);
        break;
      case "/report/get-revenue-total": //done
        reportsApi.getRevenueTotal(req, res);
        break;
      case "/report/get-revenue-by-clerk":
        reportsApi.getRevenueByClerk(req, res);
        break;
      case "/report/get-revenue-by-courier":
        reportsApi.getRevenueByCourier(req, res);
        break;
      case "/report/get-admin-revenue":
        reportsApi.getAdminRevenueReport(req, res);
        break;
      case "/report/get-admin-revenue-total":
        reportsApi.getAdminRevenueTotal(req, res);
        break;
      case "/report/get-admin-revenue-by-office":
        reportsApi.getAdminRevenueReportByOffice(req, res);
        break;
      case "/report/get-admin-revenue-total-by-office":
        reportsApi.getAdminRevenueTotalByOffice(req, res);
        break;

      //todo testing Admin API endpoints
      case "/admin/add-post-office":
        adminAPI.addPostOffice(req, res);
        break;
      case "/admin/delete-post-office": //done
        adminAPI.deletePostOffice(req, res);
        break;
      case "/admin/update-post-office": //done
        adminAPI.updatePostOffice(req, res);
        break;
      case "/admin/get-post-office-details": //done, although the names are null rn T^T
        adminAPI.getPostOfficeDetails(req, res);
        break;
      case "/admin/ensure-post-office-empty": //done
        adminAPI.ensurePostOfficeEmpty(req, res);
        break;

      default: //handle unknown routes
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Route not found T^T" }));
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
