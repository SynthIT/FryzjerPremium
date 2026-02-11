import { db } from "@/lib/db/init";
import { Course } from "@/lib/models/Courses";
import { zodCourses, Courses } from "@/lib/types/coursesTypes";
import { Categories } from "@/lib/types/shared";
import { Types } from "mongoose";

export async function collectCourses() {
    try {
        await db();
        const cours = await Course.find()
            .populate("kategoria")
            .populate("promocje")
            .populate("firma")
            .lean();
        return JSON.stringify(cours || []);
    } catch (error) {
        return JSON.stringify([]);
    }
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
    for (const kategoria of kategorie) {
        courseData.kategoria.push(
            new Types.ObjectId((kategoria as Categories)._id),
        );
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
