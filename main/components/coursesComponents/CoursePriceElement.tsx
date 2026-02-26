import { Courses } from "@/lib/types/coursesTypes";
import { Promos } from "@/lib/types/shared";
import { finalPrice } from "@/lib/utils";

interface CoursePriceElementProps {
    course: Courses;
    promo: Promos;
}

export default function CoursePriceElement({ course, promo }: CoursePriceElementProps) {
    if (promo) {
        if (promo.special?.obniza_cene) {
            return (
                <div className="flex flex-col  ml-3 pl-3 border-l-2 border-red-500">
                    <p className="text-sm text-gray-500">Normalna: {finalPrice(course.cena, course.vat, undefined, undefined)} zł</p>
                    <p className="text-lg text-red-500">Nowa: {finalPrice(course.cena, course.vat, undefined, promo)} zł przy zakupie {promo.special?.warunek} kursów</p>
                    <p className="text-md text-red-500">Obniżka: {promo.special?.obnizka}%</p>
                </div>
            );
        }
        if (promo.special?.zmienia_cene) {
            return (
                <div className="flex flex-col ml-3 pl-3 border-l-2 border-red-500">
                    <p className="text-sm text-gray-500 line-through">Stara: {finalPrice(course.cena, course.vat, undefined, undefined)} zł</p>
                    <p className="text-lg text-red-500">Nowa cena: {finalPrice(course.cena, course.vat, undefined, promo)} zł przy zakupie {promo.special?.warunek} kursów</p>
                </div>
            );
        }
        return (
            <div className="flex flex-col ml-3 pl-3 border-l-2 border-red-500">
                <p className="text-sm text-gray-500 line-through">{finalPrice(course.cena, course.vat, undefined, undefined)} zł</p>
                <p className="text-lg text-red-500">{finalPrice(course.cena, course.vat, undefined, promo)} zł</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col ml-3 pl-3 border-l-2">
            <p className="font-bold text-lg text-gray-900">{finalPrice(course.cena, course.vat, undefined, undefined)} zł</p>
        </div>
    );
}