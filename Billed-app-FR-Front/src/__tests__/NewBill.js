/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import "@testing-library/jest-dom/extend-expect";
import { ROUTES } from "../constants/routes";
import BillsUI from "../views/BillsUI.js";
import VerticalLayout from "../views/VerticalLayout.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { mockedBills } from "../__mocks__/store";
import store from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";

describe("Given I am connected as an employee", () => {
   describe("When I am on NewBill Page", () => {
      // #18
      test("Then mail icon in vertical layout should be highlighted", () => {
         Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
         });
         const user = JSON.stringify({
            type: "Employee",
         });
         window.localStorage.setItem("user", user);
         document.body.innerHTML = VerticalLayout(120);
         expect(screen.getByTestId("icon-mail")).toBeTruthy();
      });

      // #19
      test("Then, logout icon in vertical layout should be displayed", () => {
         document.body.innerHTML = NewBillUI();
         const logoutBtn = document.getElementById("layout-disconnect");
         expect(logoutBtn).toBeTruthy();
      });

      // #20
      test("Then, all input fields should be displayed", () => {
         const form = screen.getByTestId("form-new-bill").length;
         expect(form).toBe(9);
      });
   });

   describe("When I upload a file in the correct format", () => {
      // #21
      test("Then, the file name should be displayed in the input field", () => {
         document.body.innerHTML = NewBillUI({});

         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
         };

         const bill = new NewBill({
            document,
            onNavigate,
            store,
            localStorage: window.localStorage,
         });

         const handleChangeFile = jest.fn(() => bill.handleChangeFile);
         const file = screen.getByTestId("file");

         file.addEventListener("change", handleChangeFile);
         fireEvent.change(file, {
            target: {
               files: [
                  new File(["test.jpg"], "test.jpg", {
                     type: "image/jpeg",
                  }),
               ],
            },
         });

         expect(handleChangeFile).toHaveBeenCalled();
         expect(file.files[0].name).toBe("test.jpg");
         expect(file.files[0].type).toBe("image/jpeg");
      });
   });

   describe("When I upload a file in the incorrect format", () => {
      // #22
      test("Then, the input field should be empty and an error message should appear", () => {
         document.body.innerHTML = NewBillUI({});

         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
         };

         const bill = new NewBill({
            document,
            onNavigate,
            store,
            localStorage: window.localStorage,
         });

         const handleChangeFile = jest.fn(() => bill.handleChangeFile);
         const file = screen.getByTestId("file");
         const fileTypeError = document.querySelector(".fileTypeError");
         const fileEntry = screen.getByTestId("file");

         file.addEventListener("change", handleChangeFile);
         fireEvent.change(file, {
            target: {
               files: [
                  new File(["test.docx"], "test.docx", {
                     type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  }),
               ],
            },
         });

         expect(handleChangeFile).toHaveBeenCalled();
         expect(fileEntry.value).toBe("");
         expect(fileTypeError.textContent).toBe(
            'Erreur. Seuls les fichiers "jpg", "jpeg" ou "png" sont acceptés'
         );
      });
   });

   describe("When I submit the bill with correct data", () => {
      // #23
      test("Then, I should be sent to the Bills page and see a new bill appear on the page", async () => {
         // Create and submit a new bill
         // --------------------------------
         const bill = await mockedBills.update();

         document.body.innerHTML = NewBillUI({});
         const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
         };
         const store = null;

         const newBill = new NewBill({
            document,
            onNavigate,
            store,
            localStorage: window.localStorage,
         });

         const billType = (screen.getByTestId("expense-type").value =
            bill.type);
         const billName = (screen.getByTestId("expense-name").value =
            bill.name);
         const billAmount = (screen.getByTestId("amount").value = bill.amount);
         const billDate = (screen.getByTestId("datepicker").value = bill.date);
         const billVat = (screen.getByTestId("vat").value = bill.vat);
         const billPct = (screen.getByTestId("pct").value = bill.pct);
         const billCommentary = (screen.getByTestId("commentary").value =
            bill.commentary);
         newBill.fileUrl = bill.fileUrl;
         newBill.fileName = bill.fileName;
         const billStatus = bill.status;

         const displayNewBill = screen.getByTestId("form-new-bill");
         expect(displayNewBill).toBeTruthy();

         // Submit the bill
         // --------------------------------
         const submit = screen.getByTestId("form-new-bill");
         const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
         submit.addEventListener("click", handleSubmit);
         fireEvent.click(submit);
         expect(handleSubmit).toHaveBeenCalled();

         const updateBill = jest.fn((e) => newBill.updateBill(e));
         submit.addEventListener("click", updateBill);
         fireEvent.click(submit);

         expect(updateBill).toHaveBeenCalled();
         expect(screen.getByText("Mes notes de frais")).toBeDefined();

         // Get the new bill total on the Bills page
         // -----------------------------------------
         const billsLength = (await mockedBills.list()).length;
         expect(bills.length).toBe(billsLength);
      });
   });
   //
});

// POST integration test
describe("Given I am a user connected as Employee", () => {
   describe("When I navigate to the page of a new bill", () => {
      // #24
      test("Then I should add a new bill from mock API POST", async () => {
         const getmockedBill = jest.spyOn(mockedBills, "update");
         const bills = await mockedBills.update();
         expect(getmockedBill).toHaveBeenCalledTimes(1);
         expect(bills).toBeTruthy();
      });

      // #25
      test("Then it add bills from an API and fails with 404 message error", async () => {
         mockedBills.update.mockImplementationOnce(() =>
            Promise.reject(new Error("Erreur 404"))
         );
         document.body.innerHTML = BillsUI({ error: "Erreur 404" });
         const message = await screen.queryByText("Erreur 404");
         expect(message).toBeTruthy();
      });

      // #26
      test("Then it add bill from an API and fails with 500 message error", async () => {
         mockedBills.update.mockImplementationOnce(() =>
            Promise.reject(new Error("Erreur 500"))
         );
         document.body.innerHTML = BillsUI({ error: "Erreur 500" });
         const message = await screen.queryByText("Erreur 500");
         expect(message).toBeTruthy();
      });
   });
});
