using FluentValidation;
using NPS.Application.Features.Votes.Commands;

namespace NPS.Application.Validators;

public class CreateVoteCommandValidator : AbstractValidator<CreateVoteCommand>
{
    public CreateVoteCommandValidator()
    {
        RuleFor(x => x.Score)
            .InclusiveBetween(0, 10).WithMessage("El puntaje debe estar entre 0 y 10");

        RuleFor(x => x.Comment)
            .MaximumLength(500).WithMessage("El comentario no puede exceder 500 caracteres");
    }
}
