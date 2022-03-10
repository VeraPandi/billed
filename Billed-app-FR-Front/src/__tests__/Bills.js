/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import { mockedBills } from "../__mocks__/store";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
   describe("When I am on Bills Page", () => {
      // #05
      test("Then bill icon in vertical layout should be highlighted", async () => {
         Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
         });
         window.localStorage.setItem(
            "user",
            JSON.stringify({
               type: "Employee",
            })
         );
         const root = document.createElement("div");
         root.setAttribute("id", "root");
         document.body.append(root);
         router();
         window.onNavigate(ROUTES_PATH.Bills);
         await waitFor(() => screen.getByTestId("icon-window"));
         expect(screen.getByTestId("icon-window")).toBeTruthy();
      });

      // #06
      test("Then bills should be ordered from earliest to latest", () => {
         document.body.innerHTML = BillsUI({ data: bills });
         const dates = screen
            .getAllByText(
               /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
            )
            .map((a) => a.innerHTML);
         const antiChrono = (a, b) => (a < b ? 1 : -1);
         const datesSorted = [...dates].sort(antiChrono);
         expect(dates).toEqual(datesSorted);
      });

      // #07
      test("Then, logout icon in vertical layout should be displayed", () => {
         const logoutBtn = document.getElementById("layout-disconnect");
         expect(logoutBtn).toBeTruthy();
      });

      // #08
      test("Then, I should see the button to create a bill", () => {
         const newBillBtn = screen.getByTestId("btn-new-bill");
         expect(newBillBtn).toBeDefined();
      });

      // #09
      test("Then, sent bills should be displayed on the page", () => {
         const billTableLength = screen.getByTestId("tbody").childElementCount;
         expect(billTableLength).toEqual(bills.length);
      });

      // #10
      test("Then, all fields should display bill data", () => {
         document.body.innerHTML = BillsUI({ data: bills });
         const amount = screen.getAllByTestId("amount")[0].innerHTML;

         expect(screen.getByText(bills[0].type)).not.toBeUndefined();
         expect(screen.getByText(bills[0].name)).not.toBeUndefined();
         expect(screen.getByText(bills[0].date)).not.toBeUndefined();
         expect(amount).toStrictEqual(`${bills[0].amount.toString()} €`);
         expect(screen.getByText(bills[0].status)).not.toBeUndefined();
      });
   });

   describe("when I click on an eye icon button", () => {
      // #11
      test("Then, a modal containing a downloaded file should open", () => {
         document.body.innerHTML = BillsUI({ data: bills });

         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
         };

         const store = null;
         const bill = new Bills({
            document,
            onNavigate,
            store,
            localStorage: window.localStorage,
         });

         const eyeIcon = screen.getAllByTestId("icon-eye")[0];

         const handleClickIconEye = jest.fn(() => {
            bill.handleClickIconEye(eyeIcon);
         });
         $.fn.modal = jest.fn();

         eyeIcon.addEventListener("click", handleClickIconEye);
         fireEvent.click(eyeIcon);
         expect(handleClickIconEye).toHaveBeenCalled();
         expect(eyeIcon.dataset.billUrl).not.toBe(null);
      });
   });

   describe("when I click on the 'nouvelle note de frais' button", () => {
      // #12
      test("Then, It should renders a new bill page", () => {
         document.body.innerHTML = BillsUI({ data: bills });

         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
         };

         const store = null;
         const bill = new Bills({
            document,
            onNavigate,
            store,
            localStorage: window.localStorage,
         });

         const newBillBtn = screen.getByTestId("btn-new-bill");
         expect(newBillBtn).toBeTruthy();

         const handleClickNewBill = jest.fn(bill.handleClickNewBill());

         newBillBtn.addEventListener("click", handleClickNewBill);
         fireEvent.click(newBillBtn);
         expect(handleClickNewBill).toHaveBeenCalled();
         expect(screen.queryByText("Envoyer une note de frais")).toBeDefined();
      });
   });

   describe("When I am on bills page but it is loading", () => {
      // #13
      test("Then, loading page should be rendered", () => {
         document.body.innerHTML = BillsUI({ loading: true });
         expect(screen.getAllByText("Loading...")).toBeTruthy();
      });
   });

   describe("When I am on bills page but back-end send an error message", () => {
      // #14
      test("Then, error page should be rendered", () => {
         document.body.innerHTML = BillsUI({ error: "some error message" });
         expect(screen.getAllByText("Erreur")).toBeTruthy();
      });
   });
});

// GET integration test
describe("Given I am a user connected as Employee", () => {
   describe("When I navigate to Bills page", () => {
      // #15
      test("I should fetch bills from mock API GET", async () => {
         const getmockedBills = jest.spyOn(mockedBills, "list");
         const bills = await mockedBills.list();
         expect(getmockedBills).toHaveBeenCalledTimes(1);
         expect(bills.length).toBe(4);
      });

      // #16
      test("fetches bills from an API and fails with 404 message error", async () => {
         mockedBills.list.mockImplementationOnce(() => {
            return Promise.reject(new Error("Erreur 404"));
         });

         document.body.innerHTML = BillsUI({
            error: "Erreur 404",
         });
         expect(screen.getAllByText("Erreur 404")).toBeTruthy();
         const message = await screen.queryByText("Erreur 404");
         expect(message).toBeTruthy();
      });

      // #17
      test("fetches bills from an API and fails with 500 message error", async () => {
         mockedBills.list.mockImplementationOnce(() => {
            return Promise.reject(new Error("Erreur 500"));
         });

         document.body.innerHTML = BillsUI({
            error: "Erreur 500",
         });
         expect(screen.getAllByText("Erreur 500")).toBeTruthy();
         const message = await screen.queryByText("Erreur 500");
         expect(message).toBeTruthy();
      });
   });
});
