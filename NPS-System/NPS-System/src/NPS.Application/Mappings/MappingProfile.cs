using AutoMapper;
using NPS.Application.DTOs;
using NPS.Domain.Entities;
using NPS.Domain.Interfaces;

namespace NPS.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>();
        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore());
        
        // Vote mappings
        CreateMap<Vote, VoteDto>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.User != null ? src.User.Username : string.Empty))
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category));
        CreateMap<CreateVoteDto, Vote>();
        
        // NPS Statistics mapping
        CreateMap<NpsStatistics, NpsResultDto>();
    }
}
