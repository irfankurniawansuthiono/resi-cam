import { ButtonWithIcon } from "@/components/custom/button-with-icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
                    <DialogTitle className="text-base font-medium flex items-center gap-2">
                        <p>Video Preview — </p>
                        <p className="font-mono">{barcodeResi}</p>
                    </DialogTitle>
                </DialogHeader>

                <div className="w-full bg-black">
                    <video className="w-full aspect-video object-cover" controls autoPlay={false}>
                        <source src={videoSource} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </DialogContent>
        </Dialog>
    );
}
