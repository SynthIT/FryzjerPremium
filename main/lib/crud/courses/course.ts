import { Course } from "@/lib/models/Courses";
import { zodCourses, Courses } from "@/lib/types/coursesTypes.";
import { Categories } from "@/lib/types/shared";
import mongoose, { Types } from "mongoose";

export async function collectCourses() {
    await db();
    const cours = await Course.find()
        .populate("kategoria")
        .populate("promocje")
        .populate("firma")
        .orFail();
    await dbclose();
    return JSON.stringify(cours);
}

export async function createCourse(course: Courses) {
    zodCourses.parse(course);
    await db();
    const cours = await Course.create(course);
    await dbclose();
    return cours;
}

export async function deleteCourseBySlug(slug: string) {
    await db();
    const cours = await Course.findOneAndDelete({ slug: slug });
    await dbclose();
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
    await dbclose();
    return cours;
}

async function db() {
    await mongoose.connect("mongodb://localhost:27017/fryzjerpremium");
}
async function dbclose() {
    await mongoose.connection.close();
}
