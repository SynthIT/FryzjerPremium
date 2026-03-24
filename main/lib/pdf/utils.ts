import QRCode from "qrcode";
import pdf from "pdfkit";
import { OrderList } from "../types/userTypes";
import { Products } from "../types/productTypes";
import { Courses } from "../types/coursesTypes";
import { NextRequest } from "next/server";
import path from "path";


async function generateQRCode(data: string) {
    return await QRCode.toDataURL(data);
}

export async function generatePDF(order: OrderList) {
    const entries: Array<Array<string>> = []
    function prepareEntry(entry: Partial<Courses | Products>, quanity: number) {
        const index = entries.length + 1;
        const cenavat = entry.cena! * (1 + (entry.vat! / 100));
        const payload = [
            `${index}`,
            entry.nazwa!,
            `${quanity}`,
            "szt.",
            `${cenavat}`,
            `${entry.cena}`, `${entry.vat}%`,
            (cenavat - entry.cena!).toFixed(2),
            (quanity * cenavat).toFixed(2)
        ];

        entries.push(payload);
    }
    const ml = 40;
    const pt = 5;
    const mt = 40;
    const { dane, kursy, produkty } = order;
    for (const elem of kursy) {
        const { ilosc, pozycja } = elem;
        prepareEntry((pozycja as Courses), ilosc)
    }
    for (const elem of produkty) {
        const { ilosc, pozycja } = elem;
        prepareEntry((pozycja as Products), ilosc)
    }
    function moveToNextLine(lines: number) {
        return mt + lines * 20 + pt;
    }
    function drawLine(x1: number, y1: number, x2: number, y2: number) {
        doc.moveTo(x1, y1).lineTo(x2, y2).fillAndStroke("#aaa");
    }
    function moveToNextColumn(columns: number) {
        return ml + columns * 200;
    }
    function drawText(text: string, x: number, y: number, font = 8) {
        doc.fontSize(font).text(text, x, y);
    }
    function drawTable(entries: Array<Array<string>>, x: number, y: number) {
        doc.table({
            position: { x, y },
            defaultStyle: { align: { y: "center" } },
            rowStyles: (i) => {
                return i === 0
                    ? {
                        border: [0, 0, 2, 0],
                        borderColor: "#000000",
                        textOptions: { align: "right" },
                    }
                    : i < entries.length + 1
                        ? {
                            border: [0, 0, 1, 0],
                            borderColor: "#aaa",
                            minHeight: 16,
                        }
                        : {
                            border: [2, 0, 0, 0],
                            borderColor: "#000",
                            minHeight: 32,
                            backgroundColor: "#aaa",
                        };
            },
            columnStyles: [30, "*", 32, 32, 48, 48, 64, 48, 64],

            data: [
                [
                    "Lp.",
                    "Towar lub usługa",
                    "Ilość",
                    "Jedn.",
                    "Cena jedn. brutto",
                    "Wartość netto",
                    "Stawka VAT",
                    "Wartość VAT",
                    "Wartość brutto w PLN",
                ],
                ...entries,
                [
                    {
                        colSpan: 7,
                        text: "Suma",
                        align: { x: "right", y: "center" },
                        padding: { right: 12 },
                    } as PDFKit.Mixins.CellOptions,
                    entries.reduce((sum, row) => sum + parseFloat(row[7]), 0).toFixed(2),
                    entries.reduce((sum, row) => sum + parseFloat(row[8]), 0).toFixed(2),
                ],
            ],
        });
    }
    const chunks: Buffer[] = [];
    const doc = new pdf({
        size: "A4",
        margins: { top: 0, bottom: 40, left: 0, right: 40 },
    });
    doc.on("data", (data) => {
        chunks.push(data);
    });
    const finished = new Promise<Buffer<ArrayBuffer>>((resolve) => {
        doc.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
    });
    doc.registerFont("Roboto-Regular", path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf"));
    doc.registerFont("Roboto-Bold", path.join(process.cwd(), "public", "fonts", "Roboto-Bold.ttf"));
    doc.font("Roboto-Bold").fontSize(20).text("Faktura", ml, mt);
    doc.fontSize(10);
    doc.font("Roboto-Regular");
    drawText(
        "Numer zamówienia: " + order.numer_zamowienia,
        ml,
        moveToNextLine(1.5),
        10,
    );
    drawText(
        "Data wystawienia: " + order.data_zamowienia,
        ml + 25,
        moveToNextLine(4),
    );
    drawLine(ml, moveToNextLine(7), ml, moveToNextLine(10));
    doc.fill("#000");
    drawText("Dane sprzedawcy:", ml + 25, moveToNextLine(7));
    drawText("P.H.U Konrad Jany", ml + 25, moveToNextLine(7) + 10);
    drawText("ul. Kwiatowa 15", ml + 25, moveToNextLine(8));
    drawText("00-000 Warszawa", ml + 25, moveToNextLine(8) + 10);
    drawText("Polska", ml + 25, moveToNextLine(9));
    drawText("NIP: 1234567890", ml + 25, moveToNextLine(9) + 10);
    drawLine(
        moveToNextColumn(1.5) - 25,
        moveToNextLine(7),
        moveToNextColumn(1.5) - 25,
        moveToNextLine(10),
    );
    doc.fill("#000");
    drawText("Dane nabywcy:", moveToNextColumn(1.5), moveToNextLine(7));
    drawText(
        `${dane!.imie} ${dane!.nazwisko}`,
        moveToNextColumn(1.5),
        moveToNextLine(7) + 10,
    );
    drawText(
        "ul. " + dane!.ulica,
        moveToNextColumn(1.5),
        moveToNextLine(8),
    );
    drawText(
        `${dane!.kod_pocztowy} ${dane!.miasto}`,
        moveToNextColumn(1.5),
        moveToNextLine(8) + 10,
    );
    drawText(
        `${dane!.kraj}`,
        moveToNextColumn(1.5),
        moveToNextLine(9)
    )
    if (dane!.nip) {
        drawText(dane!.nip,
            moveToNextColumn(1.5),
            moveToNextLine(9) + 10,
        )
    }
    doc.fill("#000");
    // Yield żeby nie zablokować event loop – doc.table() robi synchronicznie layout + rysowanie każdej komórki
    await new Promise<void>((r) => setImmediate(r));
    drawTable(entries, ml, moveToNextLine(12));
    doc.end();

    return await finished;
}

export async function generateTicket(req: NextRequest, order: OrderList) {
    const { host, protocol } = new URL(req.url);
    const ml = 40;
    const pt = 5;
    const mt = 40;
    function moveToNextLine(lines: number) {
        return mt + lines * 20 + pt;
    }
    function moveToNextColumn(columns: number) {
        return ml + columns * 200;
    }
    function drawText(text: string, x: number, y: number, font = 8) {
        doc.fontSize(font).text(text, x, y);
    }
    async function printPage(poz: number, max: number) {
        const url = `${protocol}//${host}/admin/orders/${order.numer_zamowienia}/${poz}`;
        const qr = await generateQRCode(url);
        const kurs = order.kursy[poz].pozycja as Courses;
        doc.addPage({ size: "C6", layout: "landscape", margins: { top: 0, bottom: 40, left: 0, right: 40 } });
        drawText("Bilet wstępu " + (poz + 1) + "/" + max, ml, mt, 20);
        drawText("Kurs: " + kurs.nazwa, ml, moveToNextLine(2));
        doc.image(qr, moveToNextColumn(1), moveToNextLine(2));
    }

    const doc = new pdf({
        size: "C6",
        margins: { top: 0, bottom: 40, left: 0, right: 40 },
        layout: "landscape",
        bufferPages: true,
    });
    const chunks: Buffer[] = [];
    doc.on("data", (data) => {
        chunks.push(data);
    });
    const finished = new Promise<Buffer<ArrayBuffer>>((resolve, reject) => {
        doc.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
    });
    doc.registerFont("Roboto-Regular", path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf"));
    doc.registerFont("Roboto-Bold", path.join(process.cwd(), "public", "fonts", "Roboto-Bold.ttf"));
    doc.font("Roboto-Bold").fontSize(20).text("Bilety wstępu", ml, mt);
    doc.font("Roboto-Regular");
    drawText("Bilety kupione na klienta: " + order.dane?.imie + " " + order.dane?.nazwisko, ml, moveToNextLine(1));
    drawText("Numer zamówienia: " + order.numer_zamowienia, ml, moveToNextLine(3));
    drawText("Data zamówienia: " + order.createdAt, ml, moveToNextLine(2));
    drawText("Suma: " + order.suma, ml, moveToNextLine(4));
    for (let i = 0; i < order.kursy.length; i++) {
        console.log((order.kursy[i].pozycja as Courses).nazwa);
        await printPage(i, order.kursy.length);
    }
    doc.end();
    return await finished;
}

// export async function generateCorrectionInvoice(order: OrderList) {
//     const entries: Array<Array<string>> = []
//     function prepareEntry(entry: Partial<Courses | Products>, oldQuantity: number, quanity: number) {
//         const index = entries.length + 1;
//         const cenavat = entry.cena! * (1 + (entry.vat! / 100));
//         const payload = [
//             `${index}`,
//             entry.nazwa!,
//             `${oldQuantity}`,
//             `${quanity}`,
//             "szt.",
//             `-${cenavat}`,
//             `-${entry.cena}`, `${entry.vat}%`,
//             `-${(cenavat - entry.cena!).toFixed(2)}`,
//             `-${(quanity * cenavat).toFixed(2)}`
//         ];

//         entries.push(payload);
//     }
//     const ml = 40;
//     const pt = 5;
//     const mt = 40;
//     const { dane, kursy, produkty } = order;
//     for (const elem of kursy) {
//         const { ilosc, pozycja } = elem;
//         prepareEntry((pozycja as Courses), ilosc)
//     }
//     for (const elem of produkty) {
//         const { ilosc, pozycja } = elem;
//         prepareEntry((pozycja as Products), ilosc)
//     }
//     function moveToNextLine(lines: number) {
//         return mt + lines * 20 + pt;
//     }
//     function drawLine(x1: number, y1: number, x2: number, y2: number) {
//         doc.moveTo(x1, y1).lineTo(x2, y2).fillAndStroke("#aaa");
//     }
//     function moveToNextColumn(columns: number) {
//         return ml + columns * 200;
//     }
//     function drawText(text: string, x: number, y: number, font = 8) {
//         doc.fontSize(font).text(text, x, y);
//     }
//     function drawTable(entries: Array<Array<string>>, x: number, y: number) {
//         doc.table({
//             position: { x, y },
//             defaultStyle: { align: { y: "center" } },
//             rowStyles: (i) => {
//                 return i === 0
//                     ? {
//                         border: [0, 0, 2, 0],
//                         borderColor: "#000000",
//                         textOptions: { align: "right" },
//                     }
//                     : i < entries.length + 1
//                         ? {
//                             border: [0, 0, 1, 0],
//                             borderColor: "#aaa",
//                             minHeight: 16,
//                         }
//                         : {
//                             border: [2, 0, 0, 0],
//                             borderColor: "#000",
//                             minHeight: 32,
//                             backgroundColor: "#aaa",
//                         };
//             },
//             columnStyles: [30, "*", 32, 32, 48, 48, 64, 48, 64],

//             data: [
//                 [
//                     "Lp.",
//                     "Towar lub usługa",
//                     "Było",
//                     "Jest",
//                     "Jedn.",
//                     "Cena jedn. brutto",
//                     "Wartość netto",
//                     "Stawka VAT",
//                     "Wartość VAT",
//                     "Wartość brutto w PLN",
//                 ],
//                 ...entries,
//                 [
//                     {
//                         colSpan: 7,
//                         text: "Suma",
//                         align: { x: "right", y: "center" },
//                         padding: { right: 12 },
//                     } as PDFKit.Mixins.CellOptions,
//                     entries.reduce((sum, row) => sum + parseFloat(row[7]), 0).toFixed(2),
//                     entries.reduce((sum, row) => sum + parseFloat(row[8]), 0).toFixed(2),
//                 ],
//             ],
//         });
//     }
//     const chunks: Buffer[] = [];
//     const doc = new pdf({
//         size: "A4",
//         margins: { top: 0, bottom: 40, left: 0, right: 40 },
//     });
//     doc.on("data", (data) => {
//         chunks.push(data);
//     });
//     const finished = new Promise<Buffer<ArrayBuffer>>((resolve) => {
//         doc.on("end", () => {
//             resolve(Buffer.concat(chunks));
//         });
//     });
//     doc.registerFont("Roboto-Regular", path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf"));
//     doc.registerFont("Roboto-Bold", path.join(process.cwd(), "public", "fonts", "Roboto-Bold.ttf"));
//     doc.font("Roboto-Bold").fontSize(20).text("Faktura", ml, mt);
//     doc.fontSize(10);
//     doc.font("Roboto-Regular");

//     return await finished;
// }