/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import Logout from "../containers/Logout.js";
import "@testing-library/jest-dom/extend-expect";
import { localStorageMock } from "../__mocks__/localStorage.js";
import DashboardUI from "../views/DashboardUI.js";
import userEvent from "@testing-library/user-event";
import { ROUTES } from "../constants/routes";
import BillsUI from "../views/BillsUI.js";

const bills = [
   {
      id: "47qAXb6fIm2zOKkLzMro",
      vat: "80",
      fileUrl:
         "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      status: "pending",
      type: "Hôtel et logement",
      commentary: "séminaire billed",
      name: "encore",
      fileName: "preview-facture-free-201801-pdf-1.jpg",
      date: "2004-04-04",
      amount: 400,
      commentAdmin: "ok",
      email: "a@a",
      pct: 20,
   },
];

describe("Given I am connected as admin", () => {
   describe("When I click on disconnect button", () => {
      test("Then, I should be sent to login page", () => {
         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
         };
         Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
         });
         window.localStorage.setItem(
            "user",
            JSON.stringify({
               type: "Admin",
            })
         );
         document.body.innerHTML = DashboardUI({ bills });
         const logout = new Logout({ document, onNavigate, localStorage });
         const handleClick = jest.fn(logout.handleClick);

         const disco = screen.getByTestId("layout-disconnect");
         disco.addEventListener("click", handleClick);
         userEvent.click(disco);
         expect(handleClick).toHaveBeenCalled();
         expect(screen.getByText("Administration")).toBeTruthy();
      });
   });
});

describe("Given I am connected as employee", () => {
   describe("When I click on disconnect button", () => {
      // #27
      test("Then, I should be sent to login page", () => {
         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
         };
         Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
         });
         window.localStorage.setItem(
            "user",
            JSON.stringify({
               type: "Employee",
            })
         );
         document.body.innerHTML = BillsUI({ data: bills });
         const logout = new Logout({ document, onNavigate, localStorage });
         const handleClick = jest.fn(logout.handleClick);

         const logoutBtn = document.querySelector("#layout-disconnect");
         logoutBtn.addEventListener("click", handleClick);
         userEvent.click(logoutBtn);

         // The function which manages the reset of the URL of the page
         // and the return to the Login page is called
         expect(handleClick).toHaveBeenCalled();

         // The "employee" login form is visible on the page and returns the value "true"
         expect(screen.getByText("Employé")).toBeTruthy();
      });
   });
});
