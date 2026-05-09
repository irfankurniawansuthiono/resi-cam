import { ButtonWithIcon } from "@/components/custom/button-with-icon";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Play } from "lucide-react";

export default function PreviewVideoPack({ videoSource, barcodeResi }: { videoSource: string; barcodeResi: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <ButtonWithIcon startIcon={<Play size={15} />} variant="secondary" size="sm">
                    Preview Video
                </ButtonWithIcon>
            </DialogTrigger>
            <DialogContent className="flex flex-col gap-0 p-0 w-[70vw] max-w-[95vw]! overflow-hidden rounded-md">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="text-base font-medium">Video Preview — {barcodeResi}</DialogTitle>
                </DialogHeader>

                <div className="w-full bg-black">
                    <video className="w-full aspect-video object-cover" controls autoPlay={false}>
                        <source src={videoSource} type="video/mp4" />
                        Browser Anda tidak mendukung pemutaran video.
                    </video>
                </div>

                <DialogFooter className="px-6 py-4 border-t">
                    <DialogClose asChild>
                        <Button variant="outline" size="sm">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
