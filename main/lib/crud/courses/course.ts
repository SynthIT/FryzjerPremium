import { db } from "@/lib/db/init";
import { Course } from "@/lib/models/Courses";
import { zodCourses, Courses } from "@/lib/types/coursesTypes";
import { Categories, Opinie } from "@/lib/types/shared";
import { Types } from "mongoose";
import { LogService } from "@/lib/log_service";

export async function collectCourses() {
    await db();
    const cours = await Course.find()
        .populate("kategoria")
        .populate("promocje")
        .populate("firma")
        .lean();
    return JSON.stringify(cours || []);
}

export async function createCourse(course: Courses) {
    zodCourses.parse(course);
    await db();
    const cours = await Course.create(course);
    return cours;
}

export async function deleteCourseBySlug(slug: string) {
    await db();
    const cours = await Course.findOneAndDelete({ slug: slug });
    return cours;
}

export async function updateCourse(courseData: Courses) {
    const course = zodCourses.safeParse(courseData);
    if (course.error) return;
    const kategorie = course.data.kategoria;
    courseData.kategoria = [];
    for (const k of kategorie) {
        const id = typeof k === "string" ? k : (k as Categories)._id;
        if (id) courseData.kategoria.push(new Types.ObjectId(id) as unknown as string);
    }

    await db();
    const cours = await Course.findOneAndUpdate(
        { slug: courseData.slug },
        { $set: courseData },
        {
            new: true,
        },
    );
    return cours;
}

export async function updateCourseOpinie(slug: string, opinia: Opinie) {
    await db();
    const cours = await Course.findOneAndUpdate(
        { slug: slug },
        { $push: { opinie: opinia } },
    );
    return cours;
}